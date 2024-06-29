"use client";

import { Box, Grid, GridItem, Text, Heading, Stack, HStack, VStack, Divider, Circle, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Progress, Avatar, Flex } from "@chakra-ui/react";
import { FiBarChart2, FiUsers, FiAlertCircle } from "react-icons/fi";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const Dashboard = () => {
  const genderData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ["#4c51bf", "#ed64a6"]
      }
    ]
  };

  const ageData = {
    labels: ["<20", "20-24", "25-34", "35-44", "45+"],
    datasets: [
      {
        label: "Age Distribution",
        data: [10, 20, 30, 25, 15],
        backgroundColor: "#4c51bf"
      }
    ]
  };

  const additionsAttritionData = {
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Joined",
        data: [10, 15, 25, 30, 35, 40, 20, 25, 30, 20, 10],
        backgroundColor: "#68d391"
      },
      {
        label: "Resigned",
        data: [5, 10, 20, 25, 30, 35, 15, 20, 25, 15, 5],
        backgroundColor: "#fc8181"
      }
    ]
  };

  return (
    <Box p={5}>
      <Grid templateColumns="repeat(6, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="lg" mb={4}>Dashboard</Heading>
              <Divider />
            </Box>
            <Box>
              <Stack spacing={4}>
                <HStack>
                  <FiBarChart2 />
                  <Text>Dashboard</Text>
                </HStack>
                <HStack>
                  <FiUsers />
                  <Text>Employees</Text>
                </HStack>
                <HStack>
                  <FiAlertCircle />
                  <Text>Grievances</Text>
                </HStack>
              </Stack>
            </Box>
          </VStack>
        </GridItem>
        <GridItem colSpan={5}>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            <GridItem>
              <Stat>
                <StatLabel>Payroll</StatLabel>
                <StatNumber>$2.5M</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  $0.2M since last quarter
                </StatHelpText>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>Employees</StatLabel>
                <StatNumber>300</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  4% since last quarter
                </StatHelpText>
              </Stat>
            </GridItem>
            <GridItem>
              <Stat>
                <StatLabel>Grievances</StatLabel>
                <StatNumber>30</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  10% since last quarter
                </StatHelpText>
              </Stat>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
            <GridItem>
              <Heading size="md">Additions & Attrition</Heading>
              <Bar data={additionsAttritionData} />
            </GridItem>
            <GridItem>
              <Heading size="md">Gender Distribution</Heading>
              <Pie data={genderData} />
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
            <GridItem>
              <Heading size="md">Age Distribution</Heading>
              <Bar data={ageData} />
            </GridItem>
            <GridItem>
              <Heading size="md">Employee count by location</Heading>
              <VStack spacing={4}>
                <HStack justifyContent="space-between" w="100%">
                  <Text>San Francisco</Text>
                  <Progress value={40} size="sm" width="70%" />
                </HStack>
                <HStack justifyContent="space-between" w="100%">
                  <Text>New York City</Text>
                  <Progress value={32} size="sm" width="70%" />
                </HStack>
                <HStack justifyContent="space-between" w="100%">
                  <Text>Seattle</Text>
                  <Progress value={24} size="sm" width="70%" />
                </HStack>
              </VStack>
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;
