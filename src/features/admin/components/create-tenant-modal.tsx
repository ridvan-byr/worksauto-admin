"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Building2, Users, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { TURKEY_PROVINCES, getDistrictsForProvince } from "@/lib/turkey-locations"
import { CreateTenantInput } from "@/features/admin/api/use-admin"
import { formatSmartPhone, formatTaxNumber } from "@/lib/input-formatters"
import { cn } from "@/lib/utils"

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTenantInput) => Promise<void>
  isPending: boolean
  error?: string | null
}

const INITIAL_FORM: CreateTenantInput = {
  title: "",
  legalName: "",
  ownerName: "",
  ownerSurname: "",
  phone: "",
  email: "",
  city: "İstanbul",
  district: "",
  address: "",
  taxNumber: "",
  taxOffice: "",
  isActive: true,
}

export function CreateTenantModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  error,
}: CreateTenantModalProps) {
  const [form, setForm] = React.useState<CreateTenantInput>(INITIAL_FORM)

  React.useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM)
    }
  }, [isOpen])

  const isPhoneValid = React.useMemo(() => {
    if (!form.phone) return false
    const digits = form.phone.replace(/\D/g, "")
    return digits.length >= 10
  }, [form.phone])

  const isEmailValid = React.useMemo(() => {
    if (!form.email) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  }, [form.email])

  const isTaxNumberValid = React.useMemo(() => {
    if (!form.taxNumber) return false
    const digits = form.taxNumber.replace(/\D/g, "")
    return digits.length === 10 || digits.length === 11
  }, [form.taxNumber])

  const isTaxOfficeValid = React.useMemo(() => {
    return Boolean(form.taxOffice && form.taxOffice.trim().length >= 2)
  }, [form.taxOffice])

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

  const isFormValid =
    form.title.trim().length > 0 &&
    form.ownerName.trim().length > 0 &&
    form.ownerSurname.trim().length > 0 &&
    isPhoneValid &&
    isEmailValid &&
    isTaxNumberValid &&
    isTaxOfficeValid

  if (!isOpen || typeof document === "undefined") return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmit({
      ...form,
      title: form.title.trim(),
      legalName: form.legalName?.trim() || undefined,
      ownerName: form.ownerName.trim(),
      ownerSurname: form.ownerSurname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      city: form.city?.trim() || undefined,
      district: form.district?.trim() || undefined,
      address: form.address?.trim() || undefined,
      taxOffice: form.taxOffice?.trim() || undefined,
      taxNumber: form.taxNumber?.trim() || undefined,
    })
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
            <span>Yeni Kiracı Kaydı</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Yeni Oto Servis / Atölye Ekle</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Platforma yeni bir servis tanımlayın. Kurucu yetkili, oluşturulan telefon numarası üzerinden SMS OTP ile servisine erişebilir.
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
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Örn: Acar Oto Mekanik Servis"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Resmi Şirket Ünvanı</label>
              <input
                type="text"
                value={form.legalName || ""}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                placeholder="Örn: Acar Otomotiv San. ve Tic. Ltd. Şti."
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Users size={13} className="text-sky-500" />
              <span>İlk Yönetici / Atölye Sahibi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Adı *</label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Örn: Ahmet"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Soyadı *</label>
                <input
                  type="text"
                  required
                  value={form.ownerSurname}
                  onChange={(e) => setForm({ ...form, ownerSurname: e.target.value })}
                  placeholder="Örn: Yılmaz"
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Cep Telefonu (Giriş için) *</span>
                  {form.phone && (
                    <span className={cn("text-[10px]", isPhoneValid ? "text-emerald-500" : "text-amber-500")}>
                      {isPhoneValid ? "Geçerli" : "Eksik"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatSmartPhone(e.target.value) })}
                    placeholder="0532 000 00 00"
                    className={cn(
                      "w-full h-9 px-3 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors",
                      form.phone && !isPhoneValid
                        ? "border-amber-500/50 focus:border-amber-500"
                        : "border-slate-300 dark:border-slate-700 focus:border-sky-500"
                    )}
                  />
                  {form.phone && isPhoneValid && (
                    <CheckCircle2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>E-posta Adresi *</span>
                  {form.email && (
                    <span className={cn("text-[10px]", isEmailValid ? "text-emerald-500" : "text-amber-500")}>
                      {isEmailValid ? "Geçerli" : "Geçersiz"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ahmet@acarservis.com"
                    className={cn(
                      "w-full h-9 px-3 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors",
                      form.email && !isEmailValid
                        ? "border-amber-500/50 focus:border-amber-500"
                        : "border-slate-300 dark:border-slate-700 focus:border-sky-500"
                    )}
                  />
                  {form.email && isEmailValid && (
                    <CheckCircle2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                  )}
                </div>
              </div>
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
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Vergi Dairesi *</label>
              <input
                type="text"
                required
                value={form.taxOffice || ""}
                onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                placeholder="Örn: İkitelli VD veya Ostim VD"
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Vergi No / TCKN *</label>
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
                required
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Servisi hemen aktif et (Lisans onayı verilsin)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isFormValid}
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs gap-2 shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isPending ? "Servis Oluşturuluyor..." : "Servisi Sisteme Kaydet"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
