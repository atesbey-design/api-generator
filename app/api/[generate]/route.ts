import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pool = require("../../../conf/db.ts");

const apiKey = process.env.GEMINI_API_KEY as string;

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

let generatedDataStore: Record<string, any> = {};

async function translateText(text: string): Promise<string> {
  const prompt = `if text is in a language other than English, translate it to English. Provide the translated text: ${text}. But if the text is already in English, provide the text as is.`;

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  return result.response.text().trim();
}

async function translateColumns(columns: any[]): Promise<any[]> {
  const columnNames = columns.map((col) => col.title).join(", ");
  const prompt = `Translate the following column names to English and convert multi-word names to snake_case. Provide only the translated column names in the same order, separated by commas: ${columnNames}`;

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  const translatedText = result.response.text().trim();

  const translatedColumns = translatedText.split(", ").map((col, index) => {
    return { title: col };
  });

  return translatedColumns;
}

async function getUniqueApiName(baseApiName: string): Promise<string> {
  let apiName = baseApiName;
  let suffix = 1;

  while (true) {
    const query = `
      SELECT 1 FROM api_endpoints WHERE api_name = $1
    `;
    const values = [apiName];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return apiName;
    }

    apiName = `${baseApiName}-${suffix}`;
    suffix += 1;
  }
}

function validateRequest(body: any) {
  if (!body.description || !body.numRows || !body.columns) {
    return "Description, numRows, and columns are required.";
  }

  if (!Array.isArray(body.columns) || body.columns.length === 0) {
    return "Columns must be a non-empty array.";
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { generate: string } }
) {
  const baseApiName = request.nextUrl.searchParams.get("apiName");

  if (!baseApiName) {
    return NextResponse.json(
      { message: "API name is required" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validationError = validateRequest(body);

  if (validationError) {
    return NextResponse.json(
      { message: validationError },
      { status: 400 }
    );
  }

  const { description, numRows, columns } = body;

  // Description ve column isimlerini İngilizce'ye çevir
  const translatedDescription = await translateText(description);
  // const translatedColumns = await translateColumns(columns);

  // Benzersiz apiName oluşturma
  const apiName = await getUniqueApiName(baseApiName);

  // Prompt oluşturma
  const prompt = `
Ensure if column names are multi-word, they are converted to snake_case. if column name is not in English, translate it to English.

Generate a JSON file with the following specifications:
Description: ${description}
Number of Rows: ${columns}
Columns: ${columns.map((col: any) => col.title).join(", ")}
Output should be in the following JSON format:

[
  {
    "${columns.map((col: any) => col.title).join('": "value", "')}"
  },
  ...
]

Ensure that the JSON format is strictly followed, and the number of rows does not exceed ${numRows}. Do not include any additional text or explanations, only return the JSON data.
`;

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    let generatedData = result.response.text();

    // JSON formatını düzenleme
    generatedData = generatedData.replace(/```json\n|```/g, "").trim();

    // JSON verisini kontrol etme
    let parsedData;
    try {
      parsedData = JSON.parse(generatedData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json(
        { message: "Error parsing JSON" },
        { status: 500 }
      );
    }

    // Store the generated data in the global variable
    generatedDataStore[apiName] = {
      description: translatedDescription,
      data: parsedData,
    };

    // Veriyi veritabanına kaydet
    const saveQuery = `
      INSERT INTO api_endpoints (api_name, description, data, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    const values = [apiName, translatedDescription, JSON.stringify(parsedData)];
    await pool.query(saveQuery, values);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("Error generating data:", error);
    return NextResponse.json(
      { message: "Error generating data" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { generate: string } }
) {
  const apiName = request.nextUrl.searchParams.get("apiName");

  if (!apiName) {
    return NextResponse.json(
      { message: "API name is required" },
      { status: 400 }
    );
  }

  try {
    const query = `
      SELECT * FROM api_endpoints WHERE api_name = $1
    `;
    const values = [apiName];
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json({ message: "API not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}
