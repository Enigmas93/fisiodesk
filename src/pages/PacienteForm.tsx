import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePatient, useCreatePatient, useUpdatePatient } from '../hooks/usePatients'
import { useProfessionals } from '../hooks/useLookupData'
import { useTenantContext } from '../hooks/useTenantContext'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PatientInsert, PatientUpdate } from '../types'

export default function PacienteForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: patient, isLoading: isLoadingPatient } = usePatient(id || '')
  const { data: professionals } = useProfessionals()
  const { data: tenantContext, isLoading: isLoadingTenant } = useTenantContext()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  
  const [formData, setFormData] = useState<Partial<PatientInsert> & { rg?: string }>({
    name: '',
    cpf: null,
    birth_date: null,
    gender: null,
    phone: null,
    phone2: null,
    email: null,
    address: null,
    city: null,
    state: null,
    zip_code: null,
    blood_type: null,
    insurance: null,
    insurance_card: null,
    occupation: null,
    emergency_contact: null,
    emergency_phone: null,
    how_found: null,
    medical_history: null,
    allergies: null,
    medications: null,
    observations: null,
    status: 'active',
    tags: [],
    owner_id: null
  })

  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        cpf: patient.cpf,
        birth_date: patient.birth_date,
        gender: patient.gender,
        phone: patient.phone,
        phone2: patient.phone2,
        email: patient.email,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        zip_code: patient.zip_code,
        blood_type: patient.blood_type,
        insurance: patient.insurance,
        insurance_card: patient.insurance_card,
        occupation: patient.occupation,
        emergency_contact: patient.emergency_contact,
        emergency_phone: patient.emergency_phone,
        how_found: patient.how_found,
        medical_history: patient.medical_history,
        allergies: patient.allergies,
        medications: patient.medications,
        observations: patient.observations,
        status: patient.status || 'active',
        tags: patient.tags || [],
        owner_id: patient.owner_id
      })
    }
  }, [patient])

  useEffect(() => {
    if (!id && tenantContext?.professionalId && !formData.owner_id) {
      setFormData((prev) => ({
        ...prev,
        owner_id: tenantContext.professionalId
      }))
    }
  }, [tenantContext, id, formData.owner_id])

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...(prev.tags || []), newTag.trim()] 
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: (prev.tags || []).filter(t => t !== tag) 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (id) {
        await updatePatient.mutateAsync({ id, ...formData } as PatientUpdate & { id: string })
        toast.success('Paciente atualizado com sucesso!')
      } else {
        await createPatient.mutateAsync({
          ...formData
        } as PatientInsert)
        toast.success('Paciente criado com sucesso!')
      }
      navigate('/pacientes')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar paciente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if ((isLoadingPatient && id) || isLoadingTenant) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!tenantContext) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <p className="text-red-600 font-medium">Nao foi possivel identificar a clinica do usuario logado.</p>
        <p className="text-neutral-500 text-sm mt-2">
          Vincule este usuario a um profissional da clinica no Supabase para cadastrar pacientes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/pacientes"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            {id ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-neutral-500">
            {id ? 'Atualize os dados do paciente' : 'Preencha os dados para cadastrar um novo paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Gênero
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Telefone 2
              </label>
              <input
                type="text"
                value={formData.phone2 || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone2: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={formData.zip_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="00000-000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Rua, número, bairro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="UF"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Saúde</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo Sanguíneo
              </label>
              <select
                value={formData.blood_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, blood_type: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Convênio
              </label>
              <input
                type="text"
                value={formData.insurance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Nome do convênio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Número da Carteirinha
              </label>
              <input
                type="text"
                value={formData.insurance_card || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insurance_card: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Profissão
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Alergias
              </label>
              <textarea
                value={formData.allergies || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                rows={2}
                placeholder="Liste as alergias do paciente"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Medicamentos em Uso
              </label>
              <textarea
                value={formData.medications || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                rows={2}
                placeholder="Liste os medicamentos"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Histórico Médico
              </label>
              <textarea
                value={formData.medical_history || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_history: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                rows={3}
                placeholder="Histórico médico relevante"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Informações Adicionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contato de Emergência
              </label>
              <input
                type="text"
                value={formData.emergency_contact || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Telefone de Emergência
              </label>
              <input
                type="text"
                value={formData.emergency_phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_phone: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Como conheceu a clínica?
              </label>
              <input
                type="text"
                value={formData.how_found || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, how_found: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Profissional Responsável
              </label>
              <select
                value={formData.owner_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_id: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                {professionals?.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value || null }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="discharged">Alta</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.tags || []).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary-dark"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Adicionar tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observações
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value || null }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/pacientes"
            className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
