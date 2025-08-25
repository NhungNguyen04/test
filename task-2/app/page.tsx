import TransactionForm from "@/components/transaction-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <TransactionForm />
      </div>
    </div>
  )
}
