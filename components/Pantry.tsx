"use client";

import { useState } from "react";
import {
  addCategory,
  addItem,
  removeCategory,
  removeItem,
  renameCategory,
  renameItem,
  resetPantryToDefault,
  toggleItem,
  usePantry,
} from "@/lib/pantry-store";
import ProgressBar from "@/components/ProgressBar";

function AddItemForm({ categoryId }: { categoryId: string }) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) {
          addItem(categoryId, name);
          setName("");
        }
      }}
      className="flex gap-2 pl-6"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add item..."
        className="flex-1 border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted focus:border-gold"
      />
      <button
        type="submit"
        className="border border-gold px-3 py-1 text-xs uppercase tracking-wide text-gold transition-colors hover:border-gold-dim hover:text-foreground"
      >
        Add
      </button>
    </form>
  );
}

export default function Pantry() {
  const categories = usePantry();
  const [isEditing, setIsEditing] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.checked).length,
    0
  );
  const percent = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-[220px] flex-1 flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-muted">
            {checkedItems} / {totalItems} stocked
          </span>
          <ProgressBar percent={percent} />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reset the pantry back to the default checklist? This clears any items or categories you've added."
                )
              ) {
                resetPantryToDefault();
              }
            }}
            className="text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            Reset to default
          </button>
          <button
            type="button"
            onClick={() => setIsEditing((e) => !e)}
            className={
              isEditing
                ? "whitespace-nowrap border border-green px-4 py-2 text-xs uppercase tracking-wide text-green transition-colors"
                : "whitespace-nowrap border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
            }
          >
            {isEditing ? "Done editing" : "Edit pantry"}
          </button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-3 py-5">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <input
                  type="text"
                  defaultValue={category.name}
                  onBlur={(e) => renameCategory(category.id, e.target.value)}
                  className="font-display flex-1 border border-border bg-surface px-2 py-1 text-lg text-foreground outline-none focus:border-gold"
                  aria-label={`Rename category ${category.name}`}
                />
              ) : (
                <h2 className="font-display flex-1 text-lg text-foreground">{category.name}</h2>
              )}
              <span className="text-xs uppercase tracking-wide text-muted">
                {category.items.filter((i) => i.checked).length} / {category.items.length}
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(`Remove the "${category.name}" category and all its items?`)
                    ) {
                      removeCategory(category.id);
                    }
                  }}
                  className="text-xs uppercase tracking-wide text-wine transition-colors hover:text-foreground"
                >
                  Remove
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-2">
              {category.items.map((item) => (
                <li key={item.id} className="flex items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(category.id, item.id)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-gold"
                    aria-label={`Mark ${item.name} as stocked`}
                  />
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        defaultValue={item.name}
                        onBlur={(e) => renameItem(category.id, item.id, e.target.value)}
                        className="flex-1 border border-border bg-surface px-2 py-1 text-sm text-foreground outline-none focus:border-gold"
                        aria-label={`Edit ${item.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(category.id, item.id)}
                        className="text-xs uppercase tracking-wide text-wine transition-colors hover:text-foreground"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className={item.checked ? "text-foreground" : "text-muted"}>
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
              {category.items.length === 0 && !isEditing && (
                <li className="text-sm italic text-muted">No items in this category yet.</li>
              )}
            </ul>
            {isEditing && <AddItemForm categoryId={category.id} />}
          </div>
        ))}
      </div>

      {isEditing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newCategoryName.trim()) {
              addCategory(newCategoryName);
              setNewCategoryName("");
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name..."
            className="flex-1 border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-gold"
          />
          <button
            type="submit"
            className="border border-gold bg-gold px-4 py-2 text-xs uppercase tracking-wide text-background transition-colors hover:border-gold-dim hover:bg-gold-dim"
          >
            Add category
          </button>
        </form>
      )}
    </div>
  );
}
