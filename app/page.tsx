"use client";
import Head from "next/head";
import { useState, ChangeEvent, FormEvent } from "react";

interface Column {
  attribute: string;
}

const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
};

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([
    { attribute: "name" },
    { attribute: "rank" },
  ]);
  const [apiName, setApiName] = useState("most-popular-programming-languages");
  const [numRows, setNumRows] = useState(50);
  const [description, setDescription] = useState(
    "Most Popular Programming Languages"
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddColumn = () =>
    setColumns([...columns, { attribute: `Column ${columns.length + 1}` }]);

  const handleColumnChange = (index: number, value: string) => {
    setColumns(
      columns.map((col, i) => (i === index ? { attribute: value } : col))
    );
  };

  const handleDeleteColumn = (index: number) =>
    setColumns(columns.filter((_, i) => i !== index));

  const handleApiNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newApiName = e.target.value.replace(/\s+/g, "-");
    const randomString = generateRandomString(4);
    setApiName(newApiName);
    setGeneratedUrl(`/api/generate?apiName=${newApiName}-${randomString}`);
  };

  const handleNumRowsChange = (e: ChangeEvent<HTMLInputElement>) =>
    setNumRows(Number(e.target.value));

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDescription(e.target.value);

  const fetchApiData = async (url: string) => {
    try {
      const response = await fetch(url);

      const isJson = response.headers.get("content-type")?.includes("json");
      const data = response.ok
        ? await response.json()
        : "";
      setApiData(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiData("Error fetching API data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApi = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const randomString = generateRandomString(4);
    const newApiName = `${apiName}-${randomString}`;

    try {
      const response = await fetch(`/api/generate?apiName=${newApiName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, numRows, columns }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedUrl(`/api/generate?apiName=${newApiName}`);
        fetchApiData(`/api/generate?apiName=${newApiName}`);
      } else {
        throw new Error(await response.text());
      }
    } catch (error: any) {
      setErrorMessage(
        error.message.includes("Error parsing JSON")
          ? "Sistem şu an yoğunluktan çalışmıyor."
          : "Bir hata oluştu."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <Head>
        <title>Omtun Dataset Builder</title>
      </Head>
      <div className="container">
        <div className="content">
          <div className="build-dataset">
            <div className="colums">
              {" "}
              <h1>Build Your Dataset</h1>
              {columns.map((column, index) => (
                <div className="form-group" key={index}>
                  <label>Column Title</label>
                  <input
                    type="text"
                    value={column.attribute}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                  />
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteColumn(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <div className="add-column">
                <button onClick={handleAddColumn}>+ Add Column</button>
              </div>
            </div>

            <div className="aiask">
              <h3>Describe your API details</h3>
              <textarea
                placeholder="Describe your API here..."
                value={description}
                onChange={handleDescriptionChange}
              ></textarea>
            </div>
            <div className="configuration">
              <h3>Configuration</h3>
              <form onSubmit={handleGenerateApi}>
                <div className="form-group">
                  <label>API Name</label>
                  <input
                    type="text"
                    value={apiName}
                    onChange={handleApiNameChange}
                  />
                </div>
                <div className="form-group">
                  <label># Rows</label>
                  <input
                    type="number"
                    value={numRows}
                    onChange={handleNumRowsChange}
                  />
                </div>
                <button
                  className="generate-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate API"}
                </button>
                <div className="form-group">
                  <label>Preview:</label>
                  <a
                    className="preview-link"
                    href={generatedUrl ? generatedUrl : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {generatedUrl ? generatedUrl : "https://omtun.labs/..."}
                  </a>
                </div>
              </form>
            </div>
          </div>
          <div className="api-preview">
            <h2>API Preview</h2>
            <div className="table-placeholder">
              {loading ? (
                <p>Generating...</p>
              ) : (
                <pre>
                  {
                    errorMessage ?? apiData ?? "Click 'Generate API' to preview"
                  }
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="about">
          <h2>About</h2>
          <p>
            Omtun Dataset Builder is a tool that allows you to generate a JSON
            dataset API with custom columns and rows. You can use this tool to
            generate a JSON dataset API for testing and development purposes.
          </p>
          <p>
            To get started, add columns to your dataset, describe your API
            details, and configure the number of rows you want to generate.
            Click the &quot;Generate API&quot; button to generate your dataset
            API. You can preview the generated API URL and view the API data in
            JSON format.
          </p>
          <p>
            Omtun Dataset Builder is a free tool created by{" "}
            <a href="https://omtun.com">Omtun</a>.
          </p>
        </div>

        <div className="footer">
          <p>© 2022 Omtun. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
