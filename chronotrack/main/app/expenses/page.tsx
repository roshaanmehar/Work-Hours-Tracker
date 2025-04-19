"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, DollarSign, Calendar, Tag, FileText, X, Edit, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"
import PinLogin from "@/components/pin-login"
import styles from "./page.module.css"

// Mock data for expenses
const initialExpenses = [
  {
    id: 1,
    date: "2025-04-20",
    amount: 45.99,
    description: "Software subscription",
    category: "Software",
    job: "Web Development",
  },
  {
    id: 2,
    date: "2025-04-19",
    amount: 12.5,
    description: "Coffee with client",
    category: "Meals",
    job: "Client Meeting",
  },
  {
    id: 3,
    date: "2025-04-18",
    amount: 89.99,
    description: "Design assets",
    category: "Materials",
    job: "Design Work",
  },
  {
    id: 4,
    date: "2025-04-15",
    amount: 24.99,
    description: "Cloud storage",
    category: "Software",
    job: "Web Development",
  },
]

// Available jobs and categories
const availableJobs = [
  { id: 1, name: "Web Development" },
  { id: 2, name: "Design Work" },
  { id: 3, name: "Client Meeting" },
]

const expenseCategories = ["Software", "Hardware", "Office Supplies", "Meals", "Travel", "Materials", "Other"]

export default function ExpensesPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<number | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // New expense form state
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: expenseCategories[0],
    job: availableJobs[0].name,
  })

  // Session timeout
  useEffect(() => {
    if (!authenticated) return

    const timeout = setTimeout(() => {
      setAuthenticated(false)
    }, 90 * 1000)

    return () => clearTimeout(timeout)
  }, [authenticated])

  // Reset session timeout on user interaction
  const resetSessionTimeout = () => {
    setAuthenticated(true)
  }

  const handlePinSuccess = () => {
    setAuthenticated(true)
  }

  const handleAddExpense = () => {
    resetSessionTimeout()
    setShowAddExpense(true)
    setEditingExpense(null)
    setNewExpense({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      category: expenseCategories[0],
      job: availableJobs[0].name,
    })
  }

  const handleEditExpense = (id: number) => {
    resetSessionTimeout()
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return

    setNewExpense({
      date: expense.date,
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      job: expense.job,
    })

    setEditingExpense(id)
    setShowAddExpense(true)
  }

  const handleDeleteExpense = (id: number) => {
    resetSessionTimeout()
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault()
    resetSessionTimeout()

    if (!newExpense.amount || !newExpense.description) return

    if (editingExpense) {
      // Update existing expense
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense
            ? {
                ...expense,
                date: newExpense.date,
                amount: Number.parseFloat(newExpense.amount),
                description: newExpense.description,
                category: newExpense.category,
                job: newExpense.job,
              }
            : expense,
        ),
      )
    } else {
      // Add new expense
      const newId = Math.max(0, ...expenses.map((e) => e.id)) + 1
      setExpenses([
        ...expenses,
        {
          id: newId,
          date: newExpense.date,
          amount: Number.parseFloat(newExpense.amount),
          description: newExpense.description,
          category: newExpense.category,
          job: newExpense.job,
        },
      ])
    }

    setShowAddExpense(false)
    setEditingExpense(null)
  }

  const handleCancelExpense = () => {
    resetSessionTimeout()
    setShowAddExpense(false)
    setEditingExpense(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewExpense({
      ...newExpense,
      [name]: value,
    })
  }

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    // Filter by job
    if (filter !== "all" && expense.job !== filter) return false

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        expense.description.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower) ||
        expense.job.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Group expenses by date
  const expensesByDate = filteredExpenses.reduce(
    (acc, expense) => {
      const date = expense.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(expense)
      return acc
    },
    {} as Record<string, typeof expenses>,
  )

  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (!authenticated) {
    return <PinLogin onSuccess={handlePinSuccess} />
  }

  return (
    <div className={styles.container} onClick={resetSessionTimeout}>
      <header className={styles.header}>
        <h1>Expenses</h1>
        <motion.button className={styles.addButton} onClick={handleAddExpense} whileTap={{ scale: 0.95 }}>
          <Plus size={20} />
          <span>Add Expense</span>
        </motion.button>
      </header>

      <div className={styles.filterContainer}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.jobFilter}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className={styles.filterSelect}>
            <option value="all">All Jobs</option>
            {availableJobs.map((job) => (
              <option key={job.id} value={job.name}>
                {job.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Expenses:</span>
          <span className={styles.summaryValue}>${totalExpenses.toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Count:</span>
          <span className={styles.summaryValue}>{filteredExpenses.length} items</span>
        </div>
      </div>

      <div className={styles.expensesList}>
        {sortedDates.length === 0 ? (
          <div className={styles.emptyState}>
            <DollarSign size={48} />
            <p>No expenses found</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <Calendar size={16} />
                <h2>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
              </div>

              {expensesByDate[date].map((expense) => (
                <motion.div
                  key={expense.id}
                  className={styles.expenseCard}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.expenseDetails}>
                    <div className={styles.expenseMain}>
                      <span className={styles.expenseAmount}>${expense.amount.toFixed(2)}</span>
                      <span className={styles.expenseDescription}>{expense.description}</span>
                    </div>
                    <div className={styles.expenseMeta}>
                      <span className={styles.expenseCategory}>{expense.category}</span>
                      <span className={styles.expenseJob}>{expense.job}</span>
                    </div>
                  </div>

                  <div className={styles.expenseActions}>
                    <button className={styles.actionButton} onClick={() => handleEditExpense(expense.id)}>
                      <Edit size={16} />
                    </button>
                    <button className={styles.actionButton} onClick={() => handleDeleteExpense(expense.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddExpense && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={styles.modalHeader}>
                <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
                <button className={styles.closeButton} onClick={handleCancelExpense}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitExpense} className={styles.expenseForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">
                    <Calendar size={16} />
                    <span>Date</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newExpense.date}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="amount">
                    <DollarSign size={16} />
                    <span>Amount</span>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleInputChange}
                    className={styles.input}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">
                    <FileText size={16} />
                    <span>Description</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newExpense.description}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Enter expense description"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category">
                    <Tag size={16} />
                    <span>Category</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={newExpense.category}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    {expenseCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="job">
                    <Tag size={16} />
                    <span>Job</span>
                  </label>
                  <select
                    id="job"
                    name="job"
                    value={newExpense.job}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    {availableJobs.map((job) => (
                      <option key={job.id} value={job.name}>
                        {job.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelButton} onClick={handleCancelExpense}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    {editingExpense ? "Update" : "Add"} Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar activePage="expenses" />
    </div>
  )
}
