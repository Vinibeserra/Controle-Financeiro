import { Box, Button, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await api.post("/auth/register", { name, email, password });
      navigate("/");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      if (message === "Email already in use") {
        setError("Este e-mail já está em uso");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Flex minH="100vh">
      {/* Left Panel */}
      <Flex
        flex="1"
        bg="#2563EB"
        direction="column"
        justify="space-between"
        p={10}
        display={{ base: "none", lg: "flex" }}
      >
        <Flex align="center" gap={3}>
          <Box
            bg="rgba(255,255,255,0.2)"
            borderRadius="xl"
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </Box>
          <Text color="white" fontWeight="700" fontSize="xl" letterSpacing="-0.3px">
            FinControl
          </Text>
        </Flex>

        <Box>
          <Heading
            color="white"
            fontSize={{ lg: "3xl", xl: "4xl" }}
            fontWeight="800"
            lineHeight="1.15"
            mb={5}
          >
            Comece a controlar suas finanças hoje.
          </Heading>
          <Text color="rgba(255,255,255,0.75)" fontSize="lg">
            Crie sua conta gratuita e tenha controle total do seu dinheiro.
          </Text>
        </Box>

        <Text color="rgba(255,255,255,0.45)" fontSize="sm">
          © 2026 FinControl
        </Text>
      </Flex>

      {/* Right Panel */}
      <Flex
        flex="1"
        bg="#f8fafc"
        align="center"
        justify="center"
        p={{ base: 6, md: 12 }}
      >
        <Box w="100%" maxW="420px">
          <Box mb={8}>
            <Heading size="2xl" color="gray.900" fontWeight="700" mb={1}>
              Criar conta
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Preencha os dados abaixo para se cadastrar
            </Text>
          </Box>

          {error && (
            <Box
              bg="red.50"
              color="red.600"
              p={3}
              borderRadius="md"
              fontSize="sm"
              mb={5}
              border="1px solid"
              borderColor="red.100"
            >
              {error}
            </Box>
          )}

          <Stack gap={5} mb={6}>
            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                Nome
              </Text>
              <Input
                placeholder="Seu nome completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="white"
                borderColor="gray.200"
                size="lg"
                borderRadius="lg"
                _focusVisible={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                Email
              </Text>
              <Input
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="white"
                borderColor="gray.200"
                size="lg"
                borderRadius="lg"
                _focusVisible={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                Senha
              </Text>
              <Input
                placeholder="Mínimo 6 caracteres"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                bg="white"
                borderColor="gray.200"
                size="lg"
                borderRadius="lg"
                _focusVisible={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
              />
            </Box>
          </Stack>

          <Button
            w="full"
            size="lg"
            bg="#2563EB"
            color="white"
            borderRadius="lg"
            _hover={{ bg: "#1d4ed8" }}
            onClick={handleSubmit}
            loading={isLoading}
            mb={5}
            fontWeight="600"
          >
            Criar conta
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.500">
            Já tem uma conta?{" "}
            <Text
              as="span"
              color="#2563EB"
              fontWeight="600"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
              onClick={() => navigate("/")}
            >
              Entrar
            </Text>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
