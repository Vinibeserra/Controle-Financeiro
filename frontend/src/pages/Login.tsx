import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit() {
    console.log({
      email,
      password,
    });
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="md"
        w="100%"
        maxW="400px"
      >
        <Stack gap={4}>

        <Heading size="lg" textAlign="center">
            Finanças Pessoais
          </Heading>

          <Heading size="lg" textAlign="center">
            Login
          </Heading>

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            colorScheme="blue"
            onClick={handleSubmit}
          >
            Entrar
          </Button>

          <Button
            colorScheme="blue"
            onClick={handleSubmit}
          >
            Registrar
          </Button>

          <Text fontSize="sm" textAlign="center" color="gray.500">
            Controle Financeiro Pessoal
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
