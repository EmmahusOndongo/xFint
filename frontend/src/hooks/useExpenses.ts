// hooks/useExpenses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses.service";
import type { CreateExpenseDTO, Expense } from "@/lib/types";

export type ExpensesMode = "mine" | "manager" | "accounting";

export function useExpenses(mode: ExpensesMode = "mine") {
  const qc = useQueryClient();

  const list = useQuery<Expense[]>({
    queryKey: ["expenses", mode],
    queryFn: () =>
      mode === "mine"
        ? expensesService.getMine()
        : mode === "manager"
        ? expensesService.getForManager()
        : expensesService.getForAccounting(),
  });

  const details = (id?: string) =>
    useQuery<Expense | undefined>({
      enabled: !!id,
      queryKey: ["expense", id],
      queryFn: () => (id ? expensesService.getOne(id) : Promise.resolve(undefined)),
    });

  const create = useMutation({
    mutationFn: (dto: CreateExpenseDTO) => expensesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses", mode] }),
  });

  const approve = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => expensesService.approve(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", mode] });
      qc.invalidateQueries({ queryKey: ["expense"] });
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => expensesService.reject(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", mode] });
      qc.invalidateQueries({ queryKey: ["expense"] });
    },
  });

  const process = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) => expensesService.process(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", mode] });
      qc.invalidateQueries({ queryKey: ["expense"] });
    },
  });

  return { list, details, create, approve, reject, process };
}