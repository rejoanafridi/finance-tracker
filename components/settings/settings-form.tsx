"use client"

import type React from "react"

import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"

export function SettingsForm() {
  const { categories, addCategory, removeCategory, exportData, importData, clearAllData } = useFinance()
  const [newCategory, setNewCategory] = useState("")
  const [importError, setImportError] = useState("")

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim()) {
      addCategory(newCategory.trim())
      setNewCategory("")
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("")
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        importData(data)
      } catch (error) {
        setImportError("Invalid file format. Please upload a valid JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    exportData()
  }

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearAllData()
    }
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="data">Data Management</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your general preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifications</Label>
                <Switch id="notifications" />
              </div>
              <p className="text-sm text-muted-foreground">Receive notifications for budget alerts and reminders.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currency">Currency</Label>
                <div className="w-[180px]">
                  <Input id="currency" value="USD" disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Set your preferred currency (USD only for now).</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your transaction categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-wrap gap-2 pt-4">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="flex items-center gap-1">
                  {category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full p-0"
                    onClick={() => removeCategory(category)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
              {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories added yet.</p>}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="data">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Import, export, or clear your financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import">Import Data</Label>
              <Input id="import" type="file" accept=".json" onChange={handleImport} />
              {importError && <p className="text-sm text-destructive">{importError}</p>}
              <p className="text-sm text-muted-foreground">Import your financial data from a JSON file.</p>
            </div>
            <div className="space-y-2">
              <Label>Export Data</Label>
              <Button onClick={handleExport} className="w-full">
                Export as JSON
              </Button>
              <p className="text-sm text-muted-foreground">Export your financial data to a JSON file for backup.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleClearData} className="w-full">
              Clear All Data
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
