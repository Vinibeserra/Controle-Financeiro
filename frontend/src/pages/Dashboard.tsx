import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  categoryId: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

type View = "dashboard" | "transactions" | "categories";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#2563EB";
const PRIMARY_DARK = "#1d4ed8";
const SIDEBAR_BG = "#0f172a";
const PIE_COLORS = ["#2563EB", "#16a34a", "#f97316", "#8b5cf6", "#6b7280", "#ec4899", "#06b6d4"];
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR");

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function StatCard({
  label,
  value,
  color,
  bgColor,
  iconPath,
}: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
  iconPath: string;
}) {
  return (
    <Box flex="1" bg="white" borderRadius="xl" p={5} boxShadow="sm" minW="0">
      <Flex align="center" gap={3} mb={3}>
        <Box
          w="38px"
          h="38px"
          borderRadius="lg"
          bg={bgColor}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath} />
          </svg>
        </Box>
        <Text fontSize="sm" color="gray.500" fontWeight="500">
          {label}
        </Text>
      </Flex>
      <Text fontSize="2xl" fontWeight="700" color={color} letterSpacing="-0.5px">
        {value}
      </Text>
    </Box>
  );
}

function TypePill({ type }: { type: "INCOME" | "EXPENSE" }) {
  const isIncome = type === "INCOME";
  return (
    <Box
      display="inline-block"
      px={2.5}
      py={0.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight="600"
      bg={isIncome ? "#dcfce7" : "#fee2e2"}
      color={isIncome ? "#16a34a" : "#dc2626"}
    >
      {isIncome ? "Receita" : "Despesa"}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>("dashboard");

  // Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<"" | "INCOME" | "EXPENSE">("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Transaction modal
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");

  // Category form
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [catSuccess, setCatSuccess] = useState("");

  // ── Computed ──────────────────────────────────────────────────────────────

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [transactions]
  );

  const monthlyData = useMemo(() => {
    const map = new Map<string, { name: string; receitas: number; despesas: number; sortKey: number }>();
    transactions.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(k))
        map.set(k, {
          name: MONTH_NAMES[d.getMonth()],
          receitas: 0,
          despesas: 0,
          sortKey: d.getFullYear() * 100 + d.getMonth(),
        });
      const e = map.get(k)!;
      if (tx.type === "INCOME") e.receitas += tx.amount;
      else e.despesas += tx.amount;
    });
    return Array.from(map.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6);
  }, [transactions]);

  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((tx) => {
        const name = getCategoryName(tx.categoryId);
        map.set(name, (map.get(name) || 0) + tx.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredCategories = categories.filter((c) => !txType || c.type === txType);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getCategoryName(categoryId: string | null) {
    if (!categoryId) return "Sem categoria";
    return categories.find((c) => c.id === categoryId)?.name ?? "Sem categoria";
  }

  // ── API calls ─────────────────────────────────────────────────────────────

  async function fetchTransactions() {
    setIsLoadingTx(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
    } finally {
      setIsLoadingTx(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {}
  }

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddTransaction() {
    const amount = parseFloat(txAmount.replace(",", "."));
    if (!txTitle.trim() || isNaN(amount) || amount <= 0) {
      setTxError("Preencha título e valor válido");
      return;
    }
    setTxLoading(true);
    setTxError("");
    try {
      await api.post("/transactions", {
        title: txTitle,
        amount,
        type: txType,
        ...(txCategoryId ? { categoryId: txCategoryId } : {}),
      });
      setTxTitle("");
      setTxAmount("");
      setTxType("EXPENSE");
      setTxCategoryId("");
      setIsTxOpen(false);
      await fetchTransactions();
    } catch (err: any) {
      setTxError(err?.response?.data?.message || "Erro ao adicionar transação");
    } finally {
      setTxLoading(false);
    }
  }

  async function handleDeleteTransaction(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  }

  async function handleAddCategory() {
    if (!catName.trim()) {
      setCatError("Informe o nome da categoria");
      return;
    }
    setCatLoading(true);
    setCatError("");
    setCatSuccess("");
    try {
      await api.post("/categories", { name: catName, type: catType });
      setCatName("");
      setCatType("EXPENSE");
      setCatSuccess("Categoria criada com sucesso!");
      await fetchCategories();
    } catch (err: any) {
      setCatError(err?.response?.data?.message || "Erro ao criar categoria");
    } finally {
      setCatLoading(false);
    }
  }

  function openTxModal() {
    setTxError("");
    setIsTxOpen(true);
  }

  // ── Nav items ─────────────────────────────────────────────────────────────

  const navItems = [
    {
      label: "Dashboard",
      view: "dashboard" as View,
      icon: "M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z",
    },
    {
      label: "Transações",
      view: "transactions" as View,
      icon: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01",
    },
    {
      label: "Categorias",
      view: "categories" as View,
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4z",
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Flex minH="100vh">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Flex
        w="240px"
        minH="100vh"
        bg={SIDEBAR_BG}
        direction="column"
        flexShrink={0}
        position="sticky"
        top={0}
        h="100vh"
        overflow="hidden"
      >
        {/* Logo */}
        <Flex align="center" gap={3} px={5} py={6}>
          <Box
            bg={PRIMARY}
            borderRadius="xl"
            w="36px"
            h="36px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </Box>
          <Text color="white" fontWeight="700" fontSize="lg" letterSpacing="-0.3px">
            FinControl
          </Text>
        </Flex>

        {/* Nav */}
        <Box flex="1" px={3} py={2} overflowY="auto">
          {navItems.map(({ label, view, icon }) => {
            const isActive = activeView === view;
            return (
              <Flex
                key={view}
                align="center"
                gap={3}
                px={4}
                py={3}
                borderRadius="lg"
                cursor="pointer"
                mb={1}
                bg={isActive ? "rgba(37,99,235,0.18)" : "transparent"}
                color={isActive ? "#93c5fd" : "rgba(255,255,255,0.45)"}
                _hover={{
                  bg: isActive ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "#93c5fd" : "rgba(255,255,255,0.75)",
                }}
                onClick={() => setActiveView(view)}
                transition="all 0.15s"
              >
                <NavIcon d={icon} />
                <Text fontSize="sm" fontWeight={isActive ? "600" : "400"}>
                  {label}
                </Text>
              </Flex>
            );
          })}
        </Box>

        {/* User */}
        <Box px={4} py={5} borderTop="1px solid rgba(255,255,255,0.07)">
          <Flex justify="space-between" align="center">
            <Box minW={0}>
              <Text color="white" fontSize="sm" fontWeight="500" isTruncated>
                {user?.name}
              </Text>
              <Text color="rgba(255,255,255,0.35)" fontSize="xs" isTruncated>
                {user?.email}
              </Text>
            </Box>
            <Box
              cursor="pointer"
              color="rgba(255,255,255,0.35)"
              _hover={{ color: "white" }}
              onClick={signOut}
              title="Sair"
              flexShrink={0}
              ml={2}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </Box>
          </Flex>
        </Box>
      </Flex>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <Box flex="1" bg="#f1f5f9" minH="100vh" overflow="auto">

        {/* ═══ DASHBOARD VIEW ════════════════════════════════════════════ */}
        {activeView === "dashboard" && (
          <Box p={8}>
            {/* Header */}
            <Box mb={7}>
              <Heading size="2xl" color="gray.900" fontWeight="700" mb={1}>
                Dashboard
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Visão geral das suas finanças
              </Text>
            </Box>

            {/* Stat Cards */}
            <Flex gap={5} mb={6} wrap="wrap">
              <StatCard
                label="Receitas"
                value={formatCurrency(totalIncome)}
                color="#16a34a"
                bgColor="#dcfce7"
                iconPath="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
              <StatCard
                label="Despesas"
                value={formatCurrency(totalExpense)}
                color="#dc2626"
                bgColor="#fee2e2"
                iconPath="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
              <StatCard
                label="Saldo"
                value={formatCurrency(balance)}
                color={balance >= 0 ? PRIMARY : "#dc2626"}
                bgColor={balance >= 0 ? "#dbeafe" : "#fee2e2"}
                iconPath="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
              />
            </Flex>

            {/* Charts */}
            <Flex gap={5} mb={6} wrap={{ base: "wrap", xl: "nowrap" }}>
              {/* Area Chart */}
              <Box flex="2" minW="0" bg="white" borderRadius="xl" p={6} boxShadow="sm">
                <Heading size="md" color="gray.900" mb={6}>
                  Receitas vs Despesas
                </Heading>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                      <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#16a34a" strokeWidth={2} fill="url(#gradReceitas)" />
                      <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#dc2626" strokeWidth={2} fill="url(#gradDespesas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex h="240px" align="center" justify="center">
                    <Text color="gray.400" fontSize="sm">Nenhum dado disponível ainda</Text>
                  </Flex>
                )}
              </Box>

              {/* Pie Chart */}
              <Box flex="1" minW="240px" bg="white" borderRadius="xl" p={6} boxShadow="sm">
                <Heading size="md" color="gray.900" mb={4}>
                  Por Categoria
                </Heading>
                {categoryChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Stack gap={1.5} mt={2}>
                      {categoryChartData.slice(0, 5).map((item, i) => (
                        <Flex key={item.name} justify="space-between" align="center">
                          <Flex align="center" gap={2}>
                            <Box w="8px" h="8px" borderRadius="full" bg={PIE_COLORS[i % PIE_COLORS.length]} flexShrink={0} />
                            <Text fontSize="xs" color="gray.600">{item.name}</Text>
                          </Flex>
                          <Text fontSize="xs" color="gray.700" fontWeight="600">
                            {formatCurrency(item.value)}
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <Flex h="170px" align="center" justify="center">
                    <Text color="gray.400" fontSize="sm">Sem despesas por categoria</Text>
                  </Flex>
                )}
              </Box>
            </Flex>

            {/* Recent Transactions */}
            <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
              <Flex justify="space-between" align="center" mb={5}>
                <Heading size="md" color="gray.900">
                  Últimas Transações
                </Heading>
                <Button
                  size="sm"
                  bg={PRIMARY}
                  color="white"
                  borderRadius="lg"
                  _hover={{ bg: PRIMARY_DARK }}
                  fontWeight="600"
                  onClick={openTxModal}
                >
                  + Nova transação
                </Button>
              </Flex>

              {recentTransactions.length === 0 ? (
                <Flex py={10} justify="center">
                  <Text color="gray.400" fontSize="sm">
                    Nenhuma transação encontrada. Adicione a primeira!
                  </Text>
                </Flex>
              ) : (
                <Stack gap={0}>
                  {recentTransactions.map((tx, i) => (
                    <Flex
                      key={tx.id}
                      align="center"
                      py={3.5}
                      borderBottom={i < recentTransactions.length - 1 ? "1px solid" : "none"}
                      borderColor="gray.100"
                    >
                      <Box
                        w="38px"
                        h="38px"
                        borderRadius="lg"
                        bg={tx.type === "INCOME" ? "#dcfce7" : "#fee2e2"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        mr={3}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tx.type === "INCOME" ? "#16a34a" : "#dc2626"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {tx.type === "INCOME" ? (
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                          ) : (
                            <path d="M7 7l10 10M17 17H7M17 17V7" />
                          )}
                        </svg>
                      </Box>
                      <Box flex="1" minW={0} mr={4}>
                        <Text fontSize="sm" fontWeight="500" color="gray.900" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {tx.title}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {getCategoryName(tx.categoryId)}
                        </Text>
                      </Box>
                      <Box textAlign="right" flexShrink={0}>
                        <Text fontSize="sm" fontWeight="700" color={tx.type === "INCOME" ? "#16a34a" : "#dc2626"}>
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {formatDate(tx.createdAt)}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        )}

        {/* ═══ TRANSACTIONS VIEW ════════════════════════════════════════════ */}
        {activeView === "transactions" && (
          <Box p={8}>
            <Flex justify="space-between" align="flex-start" mb={7}>
              <Box>
                <Heading size="2xl" color="gray.900" fontWeight="700" mb={1}>
                  Transações
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Gerencie todas as suas transações
                </Text>
              </Box>
              <Button
                bg={PRIMARY}
                color="white"
                borderRadius="lg"
                _hover={{ bg: PRIMARY_DARK }}
                fontWeight="600"
                onClick={openTxModal}
              >
                + Nova transação
              </Button>
            </Flex>

            {/* Filters */}
            <Box bg="white" borderRadius="xl" p={5} boxShadow="sm" mb={5}>
              <Flex gap={3} wrap="wrap" align="flex-end">
                <Box minW="130px">
                  <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Tipo
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as "" | "INCOME" | "EXPENSE")}
                    >
                      <option value="">Todos</option>
                      <option value="INCOME">Receita</option>
                      <option value="EXPENSE">Despesa</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>

                <Box minW="155px">
                  <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Categoria
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      value={filterCategoryId}
                      onChange={(e) => setFilterCategoryId(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    De
                  </Text>
                  <Input size="sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Até
                  </Text>
                  <Input size="sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </Box>

                <Button size="sm" bg={PRIMARY} color="white" borderRadius="lg" _hover={{ bg: PRIMARY_DARK }} onClick={fetchTransactions}>
                  Filtrar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.500"
                  onClick={() => {
                    setFilterType("");
                    setFilterCategoryId("");
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Limpar
                </Button>
              </Flex>
            </Box>

            {/* Table */}
            <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
              {isLoadingTx ? (
                <Flex p={14} justify="center">
                  <Text color="gray.400">Carregando...</Text>
                </Flex>
              ) : transactions.length === 0 ? (
                <Flex p={14} justify="center">
                  <Text color="gray.400" fontSize="sm">
                    Nenhuma transação encontrada
                  </Text>
                </Flex>
              ) : (
                <Table.Root>
                  <Table.Header>
                    <Table.Row bg="gray.50">
                      {["Título", "Valor", "Tipo", "Categoria", "Data", ""].map((h) => (
                        <Table.ColumnHeader
                          key={h}
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          py={3}
                        >
                          {h}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {transactions.map((tx) => (
                      <Table.Row key={tx.id} _hover={{ bg: "gray.50" }}>
                        <Table.Cell fontWeight="500" color="gray.900">
                          {tx.title}
                        </Table.Cell>
                        <Table.Cell
                          fontWeight="600"
                          color={tx.type === "INCOME" ? "#16a34a" : "#dc2626"}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </Table.Cell>
                        <Table.Cell>
                          <TypePill type={tx.type} />
                        </Table.Cell>
                        <Table.Cell color="gray.600" fontSize="sm">
                          {getCategoryName(tx.categoryId)}
                        </Table.Cell>
                        <Table.Cell color="gray.500" fontSize="sm">
                          {formatDate(tx.createdAt)}
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="xs"
                            variant="ghost"
                            color="red.400"
                            _hover={{ bg: "red.50", color: "red.600" }}
                            onClick={() => handleDeleteTransaction(tx.id)}
                          >
                            Excluir
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </Box>
          </Box>
        )}

        {/* ═══ CATEGORIES VIEW ══════════════════════════════════════════════ */}
        {activeView === "categories" && (
          <Box p={8}>
            <Box mb={7}>
              <Heading size="2xl" color="gray.900" fontWeight="700" mb={1}>
                Categorias
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Organize suas receitas e despesas por categoria
              </Text>
            </Box>

            <Flex gap={5} align="flex-start" wrap={{ base: "wrap", md: "nowrap" }}>
              {/* List */}
              <Box flex="2" bg="white" borderRadius="xl" p={6} boxShadow="sm">
                <Heading size="md" color="gray.900" mb={5}>
                  Suas categorias
                </Heading>
                {categories.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" py={4}>
                    Nenhuma categoria cadastrada
                  </Text>
                ) : (
                  <Stack gap={2}>
                    {categories.map((c) => (
                      <Flex
                        key={c.id}
                        justify="space-between"
                        align="center"
                        py={3}
                        px={4}
                        bg="gray.50"
                        borderRadius="lg"
                        _hover={{ bg: "gray.100" }}
                        transition="background 0.1s"
                      >
                        <Text fontSize="sm" fontWeight="500" color="gray.800">
                          {c.name}
                        </Text>
                        <TypePill type={c.type} />
                      </Flex>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Form */}
              <Box flex="1" minW="240px" bg="white" borderRadius="xl" p={6} boxShadow="sm">
                <Heading size="md" color="gray.900" mb={5}>
                  Nova categoria
                </Heading>

                {catError && (
                  <Box bg="red.50" color="red.600" p={3} borderRadius="lg" fontSize="sm" mb={4} border="1px solid" borderColor="red.100">
                    {catError}
                  </Box>
                )}
                {catSuccess && (
                  <Box bg="green.50" color="green.700" p={3} borderRadius="lg" fontSize="sm" mb={4} border="1px solid" borderColor="green.100">
                    {catSuccess}
                  </Box>
                )}

                <Stack gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                      Nome
                    </Text>
                    <Input
                      placeholder="Ex: Alimentação"
                      value={catName}
                      onChange={(e) => { setCatName(e.target.value); setCatSuccess(""); }}
                      bg="gray.50"
                      borderColor="gray.200"
                      _focusVisible={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                      Tipo
                    </Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={catType}
                        onChange={(e) => setCatType(e.target.value as "INCOME" | "EXPENSE")}
                      >
                        <option value="INCOME">Receita</option>
                        <option value="EXPENSE">Despesa</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Box>

                  <Button
                    bg={PRIMARY}
                    color="white"
                    borderRadius="lg"
                    _hover={{ bg: PRIMARY_DARK }}
                    fontWeight="600"
                    onClick={handleAddCategory}
                    loading={catLoading}
                  >
                    Adicionar categoria
                  </Button>
                </Stack>
              </Box>
            </Flex>
          </Box>
        )}
      </Box>

      {/* ── Transaction Modal ─────────────────────────────────────────────── */}
      <Dialog.Root open={isTxOpen} onOpenChange={(e) => setIsTxOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl">
            <Dialog.Header>
              <Dialog.Title fontWeight="700">Nova Transação</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild position="absolute" top="3" right="3">
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>

            <Dialog.Body>
              <Stack gap={4}>
                {txError && (
                  <Box bg="red.50" color="red.600" p={3} borderRadius="lg" fontSize="sm" border="1px solid" borderColor="red.100">
                    {txError}
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">
                    Título
                  </Text>
                  <Input
                    placeholder="Ex: Aluguel"
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    _focusVisible={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">
                    Valor (R$)
                  </Text>
                  <Input
                    placeholder="0,00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    _focusVisible={{ borderColor: PRIMARY, boxShadow: `0 0 0 1px ${PRIMARY}` }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">
                    Tipo
                  </Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={txType}
                      onChange={(e) => {
                        setTxType(e.target.value as "INCOME" | "EXPENSE");
                        setTxCategoryId("");
                      }}
                    >
                      <option value="INCOME">Receita</option>
                      <option value="EXPENSE">Despesa</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="500" mb={1.5} color="gray.700">
                    Categoria{" "}
                    <Text as="span" color="gray.400" fontWeight="400">
                      (opcional)
                    </Text>
                  </Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={txCategoryId}
                      onChange={(e) => setTxCategoryId(e.target.value)}
                    >
                      <option value="">Sem categoria</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {filteredCategories.length === 0 && (
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      Nenhuma categoria de {txType === "INCOME" ? "receita" : "despesa"} cadastrada
                    </Text>
                  )}
                </Box>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer gap={2}>
              <Button variant="outline" borderRadius="lg" onClick={() => setIsTxOpen(false)}>
                Cancelar
              </Button>
              <Button
                bg={PRIMARY}
                color="white"
                borderRadius="lg"
                _hover={{ bg: PRIMARY_DARK }}
                fontWeight="600"
                onClick={handleAddTransaction}
                loading={txLoading}
              >
                Adicionar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
}
