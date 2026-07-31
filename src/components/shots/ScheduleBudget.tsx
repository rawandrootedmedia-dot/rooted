"use client";

import React, { useState } from "react";

type ScheduleDay = {
  id: string;
  title: string;
  date: string;
  callTime: string;
  shootStart: string;
  shootEnd: string;
  wrapTime: string;
  location: string;
  notes: string;
};

type BudgetItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitCost: number;
};

type ScheduleBudgetProps = {
  initialDays?: ScheduleDay[];
  initialBudget?: BudgetItem[];
  onChange?: (days: ScheduleDay[], budget: BudgetItem[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const defaultDay = (): ScheduleDay => ({
  id: uid(),
  title: "",
  date: "",
  callTime: "",
  shootStart: "",
  shootEnd: "",
  wrapTime: "",
  location: "",
  notes: "",
});

const defaultBudgetItem = (): BudgetItem => ({
  id: uid(),
  category: "Talent",
  description: "",
  quantity: 1,
  unitCost: 0,
});

export default function ScheduleBudget({ initialDays, initialBudget, onChange }: ScheduleBudgetProps) {
  const [days, setDays] = useState<ScheduleDay[]>(initialDays?.length ? initialDays : [defaultDay()]);
  const [budget, setBudget] = useState<BudgetItem[]>(initialBudget?.length ? initialBudget : []);

  function updateDay(id: string, field: keyof ScheduleDay, value: string) {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, [field]: value } : d));
      onChange?.(next, budget);
      return next;
    });
  }

  function removeDay(id: string) {
    setDays((prev) => {
      const next = prev.filter((d) => d.id !== id);
      onChange?.(next, budget);
      return next;
    });
  }

  function addDay() {
    setDays((prev) => {
      const next = [...prev, defaultDay()];
      onChange?.(next, budget);
      return next;
    });
  }

  function updateBudget(id: string, field: keyof BudgetItem, value: string | number) {
    setBudget((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, [field]: value } : b));
      onChange?.(days, next);
      return next;
    });
  }

  function removeBudget(id: string) {
    setBudget((prev) => {
      const next = prev.filter((b) => b.id !== id);
      onChange?.(days, next);
      return next;
    });
  }

  function addBudgetItem() {
    setBudget((prev) => {
      const next = [...prev, defaultBudgetItem()];
      onChange?.(days, next);
      return next;
    });
  }

  const totalCost = budget.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);

  return (
    <div>
      <h2 className="section-heading">Schedule</h2>
      {days.map((day) => (
        <div key={day.id} className="day-card">
          <div className="day-card-head">
            <input
              type="text"
              value={day.title}
              onChange={(e) => updateDay(day.id, "title", e.target.value)}
              placeholder="Day title (e.g. Day 1 — Exterior)"
            />
            <button className="remove-btn" onClick={() => removeDay(day.id)} title="Remove day">&times;</button>
          </div>

          <div className="day-grid">
            <label>
              <span>Date</span>
              <input type="text" value={day.date} onChange={(e) => updateDay(day.id, "date", e.target.value)} placeholder="MM/DD" />
            </label>
            <label>
              <span>Call Time</span>
              <input type="text" value={day.callTime} onChange={(e) => updateDay(day.id, "callTime", e.target.value)} placeholder="6:00 AM" />
            </label>
            <label>
              <span>Shoot Start</span>
              <input type="text" value={day.shootStart} onChange={(e) => updateDay(day.id, "shootStart", e.target.value)} placeholder="7:00 AM" />
            </label>
            <label>
              <span>Wrap Time</span>
              <input type="text" value={day.wrapTime} onChange={(e) => updateDay(day.id, "wrapTime", e.target.value)} placeholder="6:00 PM" />
            </label>
          </div>

          <div className="day-full">
            <label>
              <span>Location</span>
              <input type="text" value={day.location} onChange={(e) => updateDay(day.id, "location", e.target.value)} placeholder="Location" />
            </label>
            <label>
              <span>Notes</span>
              <textarea value={day.notes} onChange={(e) => updateDay(day.id, "notes", e.target.value)} placeholder="Additional notes..." />
            </label>
          </div>
        </div>
      ))}
      <button onClick={addDay}>+ Add Day</button>

      <h2 className="section-heading">Budget</h2>
      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th className="num-col">Qty</th>
            <th className="num-col">Unit Cost</th>
            <th className="num-col">Total</th>
            <th className="col-remove"></th>
          </tr>
        </thead>
        <tbody>
          {budget.map((item) => (
            <tr key={item.id}>
              <td>
                <select value={item.category} onChange={(e) => updateBudget(item.id, "category", e.target.value)}>
                  <option>Talent</option>
                  <option>Crew</option>
                  <option>Equipment</option>
                  <option>Location</option>
                  <option>Catering</option>
                  <option>Transport</option>
                  <option>Wardrobe</option>
                  <option>Post-Production</option>
                  <option>Other</option>
                </select>
              </td>
              <td>
                <input type="text" value={item.description} onChange={(e) => updateBudget(item.id, "description", e.target.value)} placeholder="Description" />
              </td>
              <td>
                <input type="number" value={item.quantity} onChange={(e) => updateBudget(item.id, "quantity", parseInt(e.target.value) || 0)} min="0" />
              </td>
              <td>
                <input type="number" value={item.unitCost} onChange={(e) => updateBudget(item.id, "unitCost", parseFloat(e.target.value) || 0)} min="0" step="0.01" />
              </td>
              <td style={{ fontFamily: "var(--font-mono)", textAlign: "right" }}>
                ${(item.quantity * item.unitCost).toFixed(2)}
              </td>
              <td>
                <button className="remove-btn" onClick={() => removeBudget(item.id)}>&times;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addBudgetItem} style={{ marginTop: 10 }}>+ Add Line Item</button>

      <div className="budget-totals">
        <span>Total: <strong>${totalCost.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}
