import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, Loader2, Receipt, CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useFinancialEntries,
  useCreateFinancialEntry,
  useUpdateFinancialEntry,
  useDeleteFinancialEntry
} from '../hooks/useFinancialEntries'
import { usePatients } from '../hooks/usePatients'
import { useProfessionals } from '../hooks/useLookupData'
import type { FinancialEntry, FinancialEntryInsert, FinancialEntryUpdate } from '../types'
import { generateReceiptPDF } from '../lib/pdf'

type FinanceTab = 'lancamentos' | 'receber' | 'pagar' | 'fluxo' | 'dre'

const defaultEntryForm = (): Partial<FinancialEntryInsert> => ({
  type: 'income',
  status: 'pending',
  amount: 0,
  category: '',
  description: '',
  due_date: '',
  paid_date: '',
  payment_method: '',
  installments: 1,
  installment_num: 1,
  is_recurring: false,
  recurrence_rule: '',
  notes: ''
})

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-')

const startOfCurrentMonth = () => {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1)
}

const monthKey = (value: string) => {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

export function Financeiro() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('lancamentos')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('todos')
  const [entryForm, setEntryForm] = useState<Partial<FinancialEntryInsert>>(defaultEntryForm())

  const { data: entries, isLoading } = useFinancialEntries()
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const createEntry = useCreateFinancialEntry()
  const updateEntry = useUpdateFinancialEntry()
  const deleteEntry = useDeleteFinancialEntry()

  const allEntries = entries || []
  const monthStart = startOfCurrentMonth()

  const currentMonthEntries = useMemo(
    () =>
      allEntries.filter((entry) => {
        const dateBase = entry.paid_date || entry.due_date || entry.created_at
        return dateBase ? new Date(dateBase) >= monthStart : false
      }),
    [allEntries]
  )

  const totalReceitas = currentMonthEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)

  const totalDespesas = currentMonthEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)

  const saldo = totalReceitas - totalDespesas

  const inadimplencia = allEntries
    .filter((entry) => entry.type === 'income' && entry.status === 'overdue')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      if (activeTab === 'receber' && (entry.type !== 'income' || entry.status === 'paid')) return false
      if (activeTab === 'pagar' && (entry.type !== 'expense' || entry.status === 'paid')) return false
      if (statusFilter !== 'todos' && entry.status !== statusFilter) return false

      const searchValue = search.trim().toLowerCase()
      if (!searchValue) return true

      const haystack = [
        entry.description,
        entry.category,
        entry.payment_method,
        entry.patient?.name,
        entry.professional?.name
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchValue)
    })
  }, [allEntries, activeTab, search, statusFilter])

  const cashflowRows = useMemo(() => {
    const grouped = new Map<string, { label: string; income: number; expense: number }>()

    allEntries.forEach((entry) => {
      const referenceDate = entry.paid_date || entry.due_date || entry.created_at
      if (!referenceDate) return

      const key = monthKey(referenceDate)
      const existing = grouped.get(key) || { label: monthLabel(key), income: 0, expense: 0 }

      if (entry.type === 'income') {
        existing.income += Number(entry.amount)
      } else {
        existing.expense += Number(entry.amount)
      }

      grouped.set(key, existing)
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => ({
        ...value,
        balance: value.income - value.expense
      }))
  }, [allEntries])

  const dreRows = useMemo(() => {
    const grouped = new Map<string, { category: string; income: number; expense: number }>()

    allEntries.forEach((entry) => {
      const category = entry.category || 'Sem categoria'
      const current = grouped.get(category) || { category, income: 0, expense: 0 }

      if (entry.type === 'income') {
        current.income += Number(entry.amount)
      } else {
        current.expense += Number(entry.amount)
      }

      grouped.set(category, current)
    })

    return Array.from(grouped.values()).map((row) => ({
      ...row,
      result: row.income - row.expense
    }))
  }, [allEntries])

  const resetEntryModal = () => {
    setShowAddModal(false)
    setEditingEntry(null)
    setEntryForm(defaultEntryForm())
  }

  const handleSaveEntry = async () => {
    if (!entryForm.description || !entryForm.amount) {
      toast.error('Preencha pelo menos descrição e valor.')
      return
    }

    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({
          id: editingEntry.id,
          ...entryForm
        } as FinancialEntryUpdate & { id: string })
        toast.success('Lançamento atualizado!')
      } else {
        await createEntry.mutateAsync({
          ...entryForm,
          amount: Number(entryForm.amount) || 0,
          installments: Number(entryForm.installments) || 1,
          installment_num: Number(entryForm.installment_num) || 1
        } as FinancialEntryInsert)
        toast.success('Lançamento adicionado!')
      }

      resetEntryModal()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar lançamento')
    }
  }

  const handleEditEntry = (entry: FinancialEntry) => {
    setEditingEntry(entry)
    setEntryForm({
      ...entry,
      due_date: entry.due_date || '',
      paid_date: entry.paid_date || '',
      category: entry.category || '',
      payment_method: entry.payment_method || '',
      recurrence_rule: entry.recurrence_rule || '',
      notes: entry.notes || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return

    try {
      await deleteEntry.mutateAsync(id)
      toast.success('Lançamento excluído!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir lançamento')
    }
  }

  const handleMarkAsPaid = async (entry: FinancialEntry) => {
    try {
      await updateEntry.mutateAsync({
        id: entry.id,
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      })
      toast.success('Lançamento marcado como pago!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar lançamento')
    }
  }

  const handlePrintReceipt = (entry: FinancialEntry) => {
    generateReceiptPDF(entry as any, 'FisioDesk')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{formatCurrency(totalReceitas)}</h3>
          <p className="text-sm text-neutral-500">Receitas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{formatCurrency(totalDespesas)}</h3>
          <p className="text-sm text-neutral-500">Despesas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </h3>
          <p className="text-sm text-neutral-500">Saldo do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{formatCurrency(inadimplencia)}</h3>
          <p className="text-sm text-neutral-500">Inadimplência</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'lancamentos', label: 'Lançamentos' },
              { id: 'receber', label: 'Contas a Receber' },
              { id: 'pagar', label: 'Contas a Pagar' },
              { id: 'fluxo', label: 'Fluxo de Caixa' },
              { id: 'dre', label: 'DRE' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FinanceTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-neutral-500 border-transparent hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">
                {activeTab === 'lancamentos' && 'Todos os Lançamentos'}
                {activeTab === 'receber' && 'Contas a Receber'}
                {activeTab === 'pagar' && 'Contas a Pagar'}
                {activeTab === 'fluxo' && 'Fluxo de Caixa'}
                {activeTab === 'dre' && 'Demonstrativo de Resultados'}
              </h3>
              <p className="text-sm text-neutral-500">
                {activeTab === 'fluxo' || activeTab === 'dre'
                  ? 'Dados consolidados em tempo real a partir dos lançamentos financeiros.'
                  : 'Cadastre, filtre e acompanhe receitas e despesas da clínica.'}
              </p>
            </div>

            {(activeTab === 'lancamentos' || activeTab === 'receber' || activeTab === 'pagar') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Lançamento
              </button>
            )}
          </div>

          {(activeTab === 'lancamentos' || activeTab === 'receber' || activeTab === 'pagar') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por descrição, paciente, categoria..."
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="todos">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <div className="px-4 py-2 rounded-lg bg-neutral-50 text-sm text-neutral-600 border border-neutral-200">
                {filteredEntries.length} lançamento(s) encontrado(s)
              </div>
            </div>
          )}

          {(activeTab === 'lancamentos' || activeTab === 'receber' || activeTab === 'pagar') && (
            <div className="space-y-4">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>Nenhum lançamento encontrado</p>
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            entry.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{entry.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-neutral-500 mt-1">
                            <span>{formatDate(entry.due_date)}</span>
                            {entry.patient?.name ? <span>Paciente: {entry.patient.name}</span> : null}
                            {entry.category ? <span>Categoria: {entry.category}</span> : null}
                            {entry.payment_method ? <span>Pagamento: {entry.payment_method}</span> : null}
                          </div>
                          {entry.notes ? <p className="text-sm text-neutral-600 mt-2">{entry.notes}</p> : null}
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`text-sm px-2 py-1 rounded-full font-medium ${
                              entry.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : entry.status === 'overdue'
                                  ? 'bg-red-100 text-red-700'
                                  : entry.status === 'cancelled'
                                    ? 'bg-neutral-200 text-neutral-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {entry.status === 'paid'
                              ? 'Pago'
                              : entry.status === 'overdue'
                                ? 'Vencido'
                                : entry.status === 'cancelled'
                                  ? 'Cancelado'
                                  : 'Pendente'}
                          </span>
                          <span className={`text-lg font-bold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.type === 'income' ? '+' : '-'} {formatCurrency(entry.amount)}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {entry.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(entry)}
                              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 p-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Marcar Pago
                            </button>
                          )}
                          {entry.status === 'paid' && entry.type === 'income' && (
                            <button
                              onClick={() => handlePrintReceipt(entry)}
                              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark p-2"
                            >
                              <Receipt className="w-4 h-4" />
                              Recibo
                            </button>
                          )}
                          <button onClick={() => handleEditEntry(entry)} className="text-primary hover:text-primary-dark p-2">
                            Editar
                          </button>
                          <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-500 hover:text-red-600 p-2">
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'fluxo' && (
            <div className="space-y-4">
              {cashflowRows.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>Nenhum lançamento disponível para montar o fluxo de caixa.</p>
                </div>
              ) : (
                cashflowRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-neutral-200 rounded-lg p-4">
                    <div>
                      <p className="text-sm text-neutral-500">Competência</p>
                      <p className="font-medium text-neutral-800">{row.label}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Entradas</p>
                      <p className="font-medium text-green-600">{formatCurrency(row.income)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Saídas</p>
                      <p className="font-medium text-red-600">{formatCurrency(row.expense)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Saldo</p>
                      <p className={`font-medium ${row.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(row.balance)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'dre' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-sm text-neutral-500">Receita Bruta</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(allEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-sm text-neutral-500">Despesas Totais</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(allEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0))}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-sm text-neutral-500">Resultado</p>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(saldo)}</p>
                </div>
              </div>

              {dreRows.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>Nenhum lançamento disponível para montar a DRE.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dreRows.map((row) => (
                    <div key={row.category} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-neutral-200 rounded-lg p-4">
                      <div>
                        <p className="text-sm text-neutral-500">Categoria</p>
                        <p className="font-medium text-neutral-800">{row.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Receitas</p>
                        <p className="font-medium text-green-600">{formatCurrency(row.income)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Despesas</p>
                        <p className="font-medium text-red-600">{formatCurrency(row.expense)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Resultado</p>
                        <p className={`font-medium ${row.result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(row.result)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">
                {editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button onClick={resetEntryModal}>
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                  <select
                    value={entryForm.type || 'income'}
                    onChange={(event) => setEntryForm({ ...entryForm, type: event.target.value as 'income' | 'expense' })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                  <select
                    value={entryForm.status || 'pending'}
                    onChange={(event) => setEntryForm({ ...entryForm, status: event.target.value as FinancialEntry['status'] })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Vencido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Descrição</label>
                <input
                  type="text"
                  value={entryForm.description || ''}
                  onChange={(event) => setEntryForm({ ...entryForm, description: event.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Valor</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={entryForm.amount || 0}
                    onChange={(event) => setEntryForm({ ...entryForm, amount: Number(event.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Categoria</label>
                  <input
                    type="text"
                    value={entryForm.category || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, category: event.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    placeholder="Ex.: Sessões, Aluguel, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Forma de pagamento</label>
                  <input
                    type="text"
                    value={entryForm.payment_method || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, payment_method: event.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    placeholder="Pix, Cartão, Dinheiro..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Paciente</label>
                  <select
                    value={entryForm.patient_id || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, patient_id: event.target.value || null })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Sem paciente vinculado</option>
                    {patients?.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Profissional</label>
                  <select
                    value={entryForm.professional_id || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, professional_id: event.target.value || null })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Profissional padrão da clínica</option>
                    {professionals?.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Vencimento</label>
                  <input
                    type="date"
                    value={entryForm.due_date || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, due_date: event.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Pagamento</label>
                  <input
                    type="date"
                    value={entryForm.paid_date || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, paid_date: event.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Parcelas</label>
                  <input
                    type="number"
                    min={1}
                    value={entryForm.installments || 1}
                    onChange={(event) => setEntryForm({ ...entryForm, installments: Number(event.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Parcela atual</label>
                  <input
                    type="number"
                    min={1}
                    value={entryForm.installment_num || 1}
                    onChange={(event) => setEntryForm({ ...entryForm, installment_num: Number(event.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={Boolean(entryForm.is_recurring)}
                    onChange={(event) => setEntryForm({ ...entryForm, is_recurring: event.target.checked })}
                  />
                  Lançamento recorrente
                </label>

                {entryForm.is_recurring && (
                  <input
                    type="text"
                    value={entryForm.recurrence_rule || ''}
                    onChange={(event) => setEntryForm({ ...entryForm, recurrence_rule: event.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    placeholder="Ex.: mensal, todo dia 10, semanal"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Observações</label>
                <textarea
                  value={entryForm.notes || ''}
                  onChange={(event) => setEntryForm({ ...entryForm, notes: event.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEntry}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={resetEntryModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
