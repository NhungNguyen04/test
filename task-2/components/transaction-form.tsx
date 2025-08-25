"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Calendar } from "lucide-react"
import { format } from "date-fns"

const transactionSchema = z.object({
  datetime: z.string().min(1, "Thời gian là bắt buộc"),
  quantity: z
    .number()
    .positive("Số lượng phải lớn hơn 0")
    .refine((val) => val !== undefined && val !== null, { message: "Số lượng là bắt buộc" }),
  column: z.string().min(1, "Trụ là bắt buộc"),
  revenue: z
    .number()
    .min(0, "Doanh thu không được âm")
    .refine((val) => val !== undefined && val !== null, { message: "Doanh thu là bắt buộc" }),
  unitPrice: z
    .number()
    .positive("Đơn giá phải lớn hơn 0")
    .refine((val) => val !== undefined && val !== null, { message: "Đơn giá là bắt buộc" }),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const columnOptions = [
  { value: "tru-1", label: "Trụ 1" },
  { value: "tru-2", label: "Trụ 2" },
  { value: "tru-3", label: "Trụ 3" },
  { value: "tru-4", label: "Trụ 4" },
]

export default function TransactionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      datetime: format(new Date(), "dd/MM/yyyy HH:mm:ss"),
      quantity: 3.03,
      column: "",
      revenue: 60000,
      unitPrice: 19800,
    },
  })

  const watchedDatetime = watch("datetime")

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Transaction data:", data)
      alert("Cập nhật giao dịch thành công!")
    } catch (error) {
      console.error("Error:", error)
      alert("Có lỗi xảy ra khi cập nhật!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const date = new Date(value)
      const formattedDate = format(date, "dd/MM/yyyy HH:mm:ss")
      setValue("datetime", formattedDate)
    }
  }

  const convertToDateTimeLocal = (dateString: string) => {
    try {
      const [datePart, timePart] = dateString.split(" ")
      const [day, month, year] = datePart.split("/")
      const [hour, minute, second] = timePart.split(":")
      const date = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
        Number.parseInt(hour),
        Number.parseInt(minute),
        Number.parseInt(second),
      )
      return format(date, "yyyy-MM-dd'T'HH:mm")
    } catch {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm")
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div
        className="flex items-start justify-between p-2 border-b border-gray-200"
        style={{
          boxShadow: "0 4px 6px -4px rgba(0,0,0,0.10)",
        }}
      >
        <div>
          <button className="flex items-center text-[12px] text-gray-600 hover:text-gray-800 mb-4">
        <div className="flex items-center justify-between">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Đóng</span>
        </div>
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">Nhập giao dịch</h1>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-1/4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-[12px] py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
        >
          {isLoading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
        {/* Thời gian */}
        <div className="space-y-2">
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-600">
            Thời gian
          </label>
          <div className="relative">
            <input
              id="datetime"
              value={watchedDatetime}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 cursor-pointer"
              onClick={() => setShowDatePicker(!showDatePicker)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-800" />
            {showDatePicker && (
              <input
                type="datetime-local"
                value={convertToDateTimeLocal(watchedDatetime)}
                onChange={handleDateTimeChange}
                className="absolute top-full left-0 mt-1 w-full p-2 border border-gray-300 rounded-md bg-white z-10"
                onBlur={() => setShowDatePicker(false)}
                autoFocus
              />
            )}
          </div>
          {errors.datetime && <p className="text-sm text-red-600">{errors.datetime.message}</p>}
        </div>

        {/* Số lượng */}
        <div className="space-y-2">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">
            Số lượng
          </label>
          <input
            id="quantity"
            type="number"
            step="0.01"
            {...register("quantity", { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.quantity ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
        </div>

        {/* Trụ */}
        <div className="space-y-2">
          <label htmlFor="column" className="block text-sm font-medium text-gray-600">
            Trụ
          </label>
          <select
            {...register("column")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.column ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Chọn trụ</option>
            {columnOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.column && <p className="text-sm text-red-600">{errors.column.message}</p>}
        </div>

        {/* Doanh thu */}
        <div className="space-y-2">
          <label htmlFor="revenue" className="block text-sm font-medium text-gray-600">
            Doanh thu
          </label>
          <input
            id="revenue"
            type="number"
            {...register("revenue", { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.revenue ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.revenue && <p className="text-sm text-red-600">{errors.revenue.message}</p>}
        </div>

        {/* Đơn giá */}
        <div className="space-y-2">
          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-600">
            Đơn giá
          </label>
          <input
            id="unitPrice"
            type="number"
            {...register("unitPrice", { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.unitPrice ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.unitPrice && <p className="text-sm text-red-600">{errors.unitPrice.message}</p>}
        </div>
        </form>
    </div>
  )
}
