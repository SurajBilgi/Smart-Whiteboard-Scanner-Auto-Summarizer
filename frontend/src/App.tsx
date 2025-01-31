import React, { useState } from "react";
import { Box, Container, Heading, Text, Flex } from "@radix-ui/themes";
import { GraduationCap, Heading2, Users } from "lucide-react";
import { StudentApp } from "./pages/StudentApp";
import { ProfessorApp } from "./pages/ProfessorApp";

type Role = "student" | "professor" | null;

function App() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  if (!selectedRole) {
    return (
      <Box
        style={{
          height: "100dvh",
          background:
            "linear-gradient(135deg, var(--accent-2), var(--accent-1))",
        }}
      >
        <Container size="2" style={{ height: "100%" }}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ height: "100%" }}
            gap="8"
          >
            <Box style={{ textAlign: "center" }} mb="4" pt="8">
              <Heading size="8" mb="4" style={{ color: "var(--accent-12)" }}>
                Welcome to Chalk GPT
              </Heading>
              <Heading size="6" mb="3">
                Your AI-Powered Whiteboard Ally for Conquering Stevens
              </Heading>
              <Text size="4" color="gray">
                Please select your role to continue
              </Text>
            </Box>

            <Flex gap="6">
              <button
                onClick={() => setSelectedRole("student")}
                className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-4 bg-white rounded-md shadow-sm
                         border border-gray-200
                         transition-all duration-300 
                         hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50 hover:border-blue-200
                         active:translate-y-0 active:shadow-md"
              >
                <Users
                  size={48}
                  className="text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                />
                <Text
                  size="5"
                  weight="bold"
                  className="transition-all duration-300 group-hover:text-blue-600"
                >
                  Student
                </Text>
              </button>

              <button
                onClick={() => setSelectedRole("professor")}
                className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-4 bg-white rounded-md shadow-sm
                         border border-gray-200
                         transition-all duration-300 
                         hover:-translate-y-1 hover:shadow-lg hover:bg-blue-50 hover:border-blue-200
                         active:translate-y-0 active:shadow-md"
              >
                <GraduationCap
                  size={48}
                  className="text-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                />
                <Text
                  size="5"
                  weight="bold"
                  className="transition-all duration-300 group-hover:text-blue-600"
                >
                  Professor
                </Text>
              </button>
            </Flex>
          </Flex>
        </Container>
      </Box>
    );
  }

  // TODO: Add the main application UI here after role selection
  if (selectedRole === "student") {
    return <StudentApp />;
  }
  return <ProfessorApp />;
}

export default App;
