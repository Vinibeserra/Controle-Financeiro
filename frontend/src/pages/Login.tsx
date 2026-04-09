import { Box, Button, Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function EyeIcon({ open }: { open: boolean }) {
  if (open)
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      setIsLoading(true);
      setError("");
      await signIn({ email, password });
      navigate("/dashboard");
    } catch {
      setError("Email ou senha inválidos");
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
            Controle suas finanças com simplicidade.
          </Heading>
          <Text color="rgba(255,255,255,0.75)" fontSize="lg">
            Gerencie receitas, despesas e categorias em um só lugar.
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
              Entrar
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Digite suas credenciais para acessar sua conta
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
              <Box position="relative">
                <Input
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  bg="white"
                  borderColor="gray.200"
                  size="lg"
                  borderRadius="lg"
                  pr="12"
                  _focusVisible={{ borderColor: "#2563EB", boxShadow: "0 0 0 1px #2563EB" }}
                />
                <Box
                  position="absolute"
                  right="4"
                  top="50%"
                  transform="translateY(-50%)"
                  cursor="pointer"
                  color="gray.400"
                  onClick={() => setShowPassword(!showPassword)}
                  zIndex={1}
                  userSelect="none"
                  _hover={{ color: "gray.600" }}
                >
                  <EyeIcon open={showPassword} />
                </Box>
              </Box>
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
            Entrar
          </Button>

          <Text textAlign="center" fontSize="sm" color="gray.500">
            Não tem uma conta?{" "}
            <Text
              as="span"
              color="#2563EB"
              fontWeight="600"
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
              onClick={() => navigate("/register")}
            >
              Criar conta
            </Text>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
