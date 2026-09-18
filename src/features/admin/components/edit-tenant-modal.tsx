"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, Building2, AlertCircle, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { TURKEY_PROVINCES, getDistrictsForProvince } from "@/lib/turkey-locations"
import { cn } from "@/lib/utils"
import type { AdminTenantDetail, UpdateTenantAdminInput } from "../api/use-admin"

interface EditTenantModalProps {
  isOpen: boolean
  tenant: AdminTenantDetail | null
  isLoading?: boolean
  onClose: () => void
  onSubmit: (tenantId: string, data: UpdateTenantAdminInput) => Promise<void>
}

function formatTaxNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 11)
}

export function EditTenantModal({
  isOpen,
  tenant,
  isLoading = false,
  onClose,
  onSubmit,
}: EditTenantModalProps) {
  const [form, setForm] = React.useState<UpdateTenantAdminInput>({
    title: "",
    legalName: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
    taxOffice: "",
    taxNumber: "",
  })
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (tenant) {
      setForm({
        title: tenant.title || "",
        legalName: tenant.legalName || "",
        phone: tenant.phone || "",
        email: tenant.email || "",
        city: tenant.city || "",
        district: tenant.district || "",
        address: tenant.address || "",
        taxOffice: tenant.taxOffice || "",
        taxNumber: tenant.taxNumber || "",
      })
      setError(null)
    }
  }, [tenant])

  const availableDistricts = React.useMemo(() => {
    return getDistrictsForProvince(form.city || "")
  }, [form.city])

  const handleCityChange = (newCity: string) => {
    const newDistricts = getDistrictsForProvince(newCity)
    const currentDistrictValid = newDistricts.includes(form.district || "")
    setForm((prev) => ({
      ...prev,
      city: newCity,
      district: currentDistrictValid ? prev.district : "",
    }))
  }

  const isTaxNumberValid = React.useMemo(() => {
    if (!form.taxNumber || form.taxNumber.trim().length === 0) return true
    const digits = form.taxNumber.replace(/\D/g, "")
    return digits.length === 10 || digits.length === 11
  }, [form.taxNumber])

  const isFormValid =
    Boolean(form.title && form.title.trim().length > 0) &&
    isTaxNumberValid

  if (!isOpen || !tenant || typeof document === "undefined") return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    setError(null)

    try {
      await onSubmit(tenant.id, {
        title: form.title?.trim(),
        legalName: form.legalName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        city: form.city?.trim() || undefined,
        district: form.district?.trim() || undefined,
        address: form.address?.trim() || undefined,
        taxOffice: form.taxOffice?.trim() || undefined,
        taxNumber: form.taxNumber?.trim() || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Güncelleme sırasında bir hata oluştu"
      setError(msg)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[88vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-semibold">
            <Building2 size={13} />
            <span>Servis Bilgilerini Güncelle</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{tenant.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Servis profil detaylarını, fatura ve adres bilgilerini düzenleyin.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Servis Tabelası / Adı *</label>
              <input
                type="text"
                required
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Örn: Acar Oto Mekanik Servis"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Resmi Şirket Ünvanı</label>
              <input
                type="text"
                value={form.legalName || ""}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                placeholder="Örn: Acar Otomotiv San. ve Tic. Ltd. Şti."
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Telefon</label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0532 000 00 00"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">E-posta</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@servis.com"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Şehir / İl</span>
                <span className="text-[10px] text-slate-400 font-normal">81 İl</span>
              </label>
              <SearchableSelect
                options={TURKEY_PROVINCES as unknown as string[]}
                value={form.city || ""}
                onChange={handleCityChange}
                placeholder="İl seçiniz veya arayınız..."
                searchPlaceholder="81 il içinde ara..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>İlçe / Semt</span>
                {form.city && availableDistricts.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {availableDistricts.length} İlçe
                  </span>
                )}
              </label>
              <SearchableSelect
                options={availableDistricts}
                value={form.district || ""}
                onChange={(district) => setForm((prev) => ({ ...prev, district }))}
                disabled={!form.city}
                disabledMessage="Önce İl Seçiniz"
                placeholder={form.city ? "İlçe seçiniz veya arayınız..." : "Önce İl Seçiniz"}
                searchPlaceholder={`${form.city || "İlçe"} ilçelerinde ara...`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Açık Adres</label>
            <input
              type="text"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Sanayi Sitesi 4. Blok No: 12"
              className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Vergi Dairesi</label>
              <input
                type="text"
                value={form.taxOffice || ""}
                onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                placeholder="Örn: İkitelli VD"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Vergi No / TCKN</label>
                {form.taxNumber && (
                  <span className={cn("text-[10px] font-medium flex items-center gap-1", isTaxNumberValid ? "text-emerald-500" : "text-amber-500")}>
                    {isTaxNumberValid ? (
                      form.taxNumber.length === 10 ? "VKN (10 hane)" : "TCKN (11 hane)"
                    ) : (
                      "10 veya 11 hane olmalıdır"
                    )}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={form.taxNumber || ""}
                onChange={(e) => setForm({ ...form, taxNumber: formatTaxNumber(e.target.value) })}
                placeholder="VKN (10 hane) veya TCKN (11 hane)"
                maxLength={11}
                className={cn(
                  "w-full h-9 px-3 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono transition-colors focus:outline-none focus:ring-2",
                  form.taxNumber && !isTaxNumberValid
                    ? "border-amber-500/50 focus:ring-amber-500/20"
                    : "border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20"
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="h-10 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold gap-2 shadow-lg shadow-sky-600/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Değişiklikleri Kaydet</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
