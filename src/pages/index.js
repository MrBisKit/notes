"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Tag, ChevronDown, Edit2, Trash2, X, Sun, Moon, Smile, Bold, Italic, List, ListOrdered, Code, Quote, Pencil } from "lucide-react";
import { Inter } from "next/font/google";
import { useTheme } from "@/components/ThemeProvider";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const inter = Inter({ subsets: ["latin"] });

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-menu-bar mb-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`menu-item ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`menu-item ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="menu-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`menu-item ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`menu-item ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      <div className="menu-divider"></div>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`menu-item ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`menu-item ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="Quote"
      >
        <Quote size={16} />
      </button>
    </div>
  );
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [categoryEmojis, setCategoryEmojis] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategoryForEmoji, setSelectedCategoryForEmoji] = useState(null);
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('📝');
  const [expandedNote, setExpandedNote] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false,
        paragraph: {
          keepMarks: true,
        }
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        if (event.key === ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const { state } = view;
          const { selection } = state;
          const { empty } = selection;

          if (empty) {
            view.dispatch(view.state.tr.insertText(' '));
            return true;
          }
        }
        return false;
      },
    },
    content: currentDescription,
    onUpdate: ({ editor }) => {
      setCurrentDescription(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && currentDescription) {
      editor.commands.setContent(currentDescription);
    }
  }, [currentDescription, editor]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setCategoryEmojis({
        ...categoryEmojis,
        [newCategory]: newCategoryEmoji
      });
      setNewCategory("");
      setNewCategoryEmoji('📝');
      setShowCategoryInput(false);
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (selectedCategoryForEmoji) {
      setCategoryEmojis({
        ...categoryEmojis,
        [selectedCategoryForEmoji]: emoji
      });
      setSelectedCategoryForEmoji(null);
    } else {
      setNewCategoryEmoji(emoji);
    }
    setShowEmojiPicker(false);
  };

  const addNote = () => {
    if (currentTitle.trim() && currentDescription.trim()) {
      const newNote = {
        title: currentTitle,
        description: currentDescription,
        category: currentCategory || selectedCategory,
        createdAt: new Date().toLocaleDateString(),
      };
      setNotes([...notes, newNote]);
      setCurrentTitle("");
      setCurrentDescription("");
      setCurrentCategory("");
      setShowAddForm(false);
      editor?.commands.setContent("");
    }
  };

  const updateNote = () => {
    if (currentTitle.trim() && currentDescription.trim()) {
      const updatedNotes = [...notes];
      updatedNotes[editingIndex] = {
        ...updatedNotes[editingIndex],
        title: currentTitle,
        description: currentDescription,
        category: currentCategory || selectedCategory,
      };
      setNotes(updatedNotes);
      setCurrentTitle("");
      setCurrentDescription("");
      setCurrentCategory("");
      setEditingIndex(null);
      setShowAddForm(false);
      editor?.commands.setContent("");
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setCurrentTitle("");
    setCurrentDescription("");
    setCurrentCategory("");
    editor?.commands.setContent("");
  };

  const editNote = (index) => {
    setEditingIndex(index);
    setCurrentTitle(notes[index].title);
    setCurrentDescription(notes[index].description);
    setCurrentCategory(notes[index].category);
    setShowAddForm(true);
  };

  const deleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`container-fluid ${inter.className}`}>
      <div className="row">
        {/* Sidebar */}
        <div 
          className="col-md-3 col-lg-2 d-md-block sidebar border-end" 
          style={{ 
            minHeight: '100vh',
            background: 'var(--sidebar-bg)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            padding: '16px',
            borderColor: 'var(--border-color) !important'
          }}
        >
          <div className="position-sticky">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0" style={{ fontWeight: 600 }}>Notes</h5>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{ borderRadius: '3px' }}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>

            {/* Search Bar */}
            <div className="position-relative mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '32px',
                  borderRadius: '3px',
                }}
              />
              <Search 
                className="position-absolute top-50 translate-middle-y text-muted" 
                style={{ left: '10px' }} 
                size={14} 
              />
            </div>

            <div className="mb-3">
              <button 
                className="btn btn-transparent w-100 d-flex align-items-center gap-2"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} /> New Note
              </button>
            </div>
            <div className="list-group mb-3">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                  selectedCategory === "All" ? "active" : ""
                }`}
                onClick={() => setSelectedCategory("All")}
              >
                <span className="category-emoji">📋</span> All Notes
              </button>
              
              {categories.map((category, index) => (
                <div key={index} className="category-item position-relative">
                  <button
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span 
                      className="category-emoji"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategoryForEmoji(category);
                        setShowEmojiPicker(true);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryEmojis[category] || '📝'}
                    </span>
                    {category}
                  </button>
                </div>
              ))}

              {showCategoryInput ? (
                <div className="list-group-item">
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className="btn btn-outline-secondary btn-sm category-emoji"
                      onClick={() => {
                        setSelectedCategoryForEmoji(null);
                        setShowEmojiPicker(!showEmojiPicker);
                      }}
                      style={{ minWidth: '36px', height: '36px' }}
                    >
                      {newCategoryEmoji}
                    </button>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Category name..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCategory();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  
                  {/* Inline Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="emoji-grid mb-2 card">
                      <div className="card-body p-2">
                        <div className="mb-2 text-muted small">Pick an emoji</div>
                        <div className="emoji-buttons">
                          {['📝', '📚', '💡', '✨', '🎯', '📌', '🔖', '📎', '🗂️', '📋', '📁', '🗄️'].map((emoji) => (
                            <button
                              key={emoji}
                              className="btn btn-light"
                              onClick={() => handleEmojiSelect(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={addCategory}
                    >
                      Add
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => {
                        setShowCategoryInput(false);
                        setNewCategory('');
                        setShowEmojiPicker(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2 text-muted"
                  onClick={() => setShowCategoryInput(true)}
                >
                  <Plus size={16} /> Add Category
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-9 col-lg-10 ms-sm-auto px-4 py-4">
          {/* Category Title */}
          <div className="d-flex align-items-center mb-4">
            <h4 className="mb-0">
              <span className="category-emoji me-2">
                {selectedCategory === "All" 
                  ? "📋" 
                  : categoryEmojis[selectedCategory] || "📝"}
              </span>
              {selectedCategory} Notes
            </h4>
          </div>

          {/* Notes Grid */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {filteredNotes.map((note, index) => (
              <div key={index} className="col">
                <div className={`card h-100 shadow-sm ${expandedNote === index ? 'expanded-note' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{note.title}</h5>
                      <button 
                        className="btn btn-link text-muted p-0"
                        onClick={() => setExpandedNote(expandedNote === index ? null : index)}
                      >
                        <ChevronDown 
                          size={18} 
                          style={{ 
                            transform: expandedNote === index ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      </button>
                    </div>
                    <div className={`note-content ${expandedNote === index ? 'expanded' : ''}`}>
                      <div 
                        className="card-text text-muted"
                        dangerouslySetInnerHTML={{ __html: note.description }}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="badge bg-light text-dark d-flex align-items-center gap-1">
                        <span className="category-emoji">
                          {categoryEmojis[note.category] || "📝"}
                        </span>
                        {note.category}
                      </span>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-icon"
                          onClick={() => editNote(notes.indexOf(note))}
                          title="Edit note"
                        >
                          <Pencil size={14} fill="currentColor" />
                        </button>
                        <button
                          className="btn btn-sm btn-icon"
                          onClick={() => deleteNote(notes.indexOf(note))}
                          title="Delete note"
                        >
                          <Trash2 size={14} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-light">
                    <small className="text-muted">Created: {note.createdAt}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state - hide when add form is visible */}
          {filteredNotes.length === 0 && !showAddForm && (
            <div className="empty-state">
              <div className="empty-state-content">
                <span className="category-emoji mb-3" style={{ fontSize: '2rem' }}>📝</span>
                <h5 className="mb-2">No notes to display</h5>
                <p className="text-muted mb-0">Create a new note to get started</p>
              </div>
            </div>
          )}

          {/* Add/Edit Note Form */}
          {showAddForm && (
            <div className="card shadow-sm mb-4 mt-5">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <span className="category-emoji me-2">
                      {editingIndex !== null ? "✏️" : "📝"}
                    </span>
                    {editingIndex !== null ? "Edit Note" : "New Note"}
                  </h5>
                  <button 
                    className="btn btn-link text-muted p-0" 
                    onClick={closeForm}
                  >
                    <X size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control form-control-lg mb-3"
                  placeholder="Note title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                />
                <div className="editor-wrapper mb-3">
                  <MenuBar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
                <div className="mb-3">
                  <select
                    className="form-select"
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    className="btn btn-secondary" 
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={editingIndex !== null ? updateNote : addNote}
                  >
                    {editingIndex !== null ? "Update Note" : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}