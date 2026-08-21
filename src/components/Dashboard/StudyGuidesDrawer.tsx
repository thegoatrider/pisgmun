import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Trash2, Plus, X, Bold, Italic, Underline, Palette, Type, Save } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

// IndexedDB Helper implementation
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pmun_delegate_db', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveFileToDB = async (fileObj: { id: string; name: string; type: string; data: string }) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const request = store.put(fileObj);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getFilesFromDB = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteFileFromDB = async (id: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const saveNoteToDB = async (noteObj: { id: string; title: string; content: string; updatedAt: string }) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    const request = store.put(noteObj);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getNotesFromDB = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notes', 'readonly');
    const store = transaction.objectStore('notes');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteNoteFromDB = async (id: string) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

interface StudyGuidesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab: 'content' | 'notes';
  delegateReg: any;
  triggerUpload?: number;
}

export const StudyGuidesDrawer: React.FC<StudyGuidesDrawerProps> = ({
  isOpen,
  onClose,
  defaultTab,
  delegateReg,
  triggerUpload
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');
  const [files, setFiles] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activeFile, setActiveFile] = useState<any>(null);
  
  // Note editing state
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState('');

  // Editor states
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [currentFont, setCurrentFont] = useState('Helvetica');
  const [currentSize, setCurrentSize] = useState('16px');
  const [currentColor, setCurrentColor] = useState('#000000');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      loadSavedData();
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (isOpen && triggerUpload && triggerUpload > 0) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
    }
  }, [isOpen, triggerUpload]);

  const loadSavedData = async () => {
    try {
      const dbFiles = await getFilesFromDB();
      const dbNotes = await getNotesFromDB();
      setFiles(dbFiles);
      setNotes(dbNotes);
    } catch (e) {
      console.error('Failed to load local database assets:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
      alert('Only PDF and Word (.doc, .docx) files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const fileObj = {
        id: `file_${Date.now()}`,
        name: file.name,
        type: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/msword'),
        data: base64Data
      };

      try {
        await saveFileToDB(fileObj);
        await loadSavedData();
      } catch (err) {
        alert('Failed to save file locally. Storage quota may be full.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this file?')) return;
    try {
      await deleteFileFromDB(id);
      if (activeFile?.id === id) setActiveFile(null);
      await loadSavedData();
    } catch (err) {
      console.error('Delete file error:', err);
    }
  };

  // Convert Base64 dataURI to safe Blob URL for previewing
  const getFileBlobUrl = (dataURI: string) => {
    try {
      const parts = dataURI.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Blob conversion failed:', e);
      return '#';
    }
  };

  // Note actions
  const handleCreateNewNote = () => {
    setActiveNoteId(`note_${Date.now()}`);
    setNoteTitle('New Note');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setSelectedImg(null);
  };

  const handleOpenNote = (note: any) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
      }
    }, 50);
    setSelectedImg(null);
  };

  const handleSaveNote = async () => {
    if (!activeNoteId) return;
    const content = editorRef.current?.innerHTML || '';
    const noteObj = {
      id: activeNoteId,
      title: noteTitle.trim() || 'Untitled Note',
      content: content,
      updatedAt: new Date().toISOString()
    };

    try {
      await saveNoteToDB(noteObj);
      setSaveSuccessMsg(true);
      await loadSavedData();
      setTimeout(() => setSaveSuccessMsg(false), 3000);
    } catch (err) {
      alert('Failed to save note.');
    }
  };

  const handleSaveRename = async (note: any) => {
    if (!renamingTitle.trim()) {
      setRenamingNoteId(null);
      return;
    }
    const updatedNote = {
      ...note,
      title: renamingTitle.trim(),
      updatedAt: new Date().toISOString()
    };
    try {
      await saveNoteToDB(updatedNote);
      setRenamingNoteId(null);
      await loadSavedData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNoteFromDB(id);
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setNoteTitle('');
      }
      await loadSavedData();
    } catch (err) {
      console.error(err);
    }
  };

  // Editor styling triggers
  const executeFormat = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
  };

  // Custom formatting applying to selection range directly (sizes, families)
  const applyCustomFormat = (styleName: 'fontSize' | 'fontFamily' | 'color', value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      // Fallback: execute standard browser commands
      if (styleName === 'fontFamily') executeFormat('fontName', value);
      if (styleName === 'color') executeFormat('foreColor', value);
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    if (styleName === 'fontSize') {
      span.style.fontSize = value;
    } else if (styleName === 'fontFamily') {
      span.style.fontFamily = value;
    } else if (styleName === 'color') {
      span.style.color = value;
    }

    try {
      range.surroundContents(span);
    } catch {
      // Fallback for overlapping tags selection ranges
      if (styleName === 'fontFamily') executeFormat('fontName', value);
      if (styleName === 'color') executeFormat('foreColor', value);
    }
  };

  // Paste / Drop image logic
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const imgHtml = `<img src="${event.target?.result}" style="max-width: 100%; border-radius: 4px; margin: 8px 0; cursor: pointer; transition: all 0.2s;" class="editor-img-node" />`;
            document.execCommand('insertHTML', false, imgHtml);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const filesList = e.dataTransfer.files;
    if (filesList && filesList.length > 0) {
      for (let i = 0; i < filesList.length; i++) {
        if (filesList[i].type.indexOf('image') !== -1) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const imgNode = document.createElement('img');
              imgNode.src = event.target?.result as string;
              imgNode.style.maxWidth = '100%';
              imgNode.style.borderRadius = '4px';
              imgNode.style.margin = '8px 0';
              imgNode.style.cursor = 'pointer';
              imgNode.className = 'editor-img-node';
              range.insertNode(imgNode);
            }
          };
          reader.readAsDataURL(filesList[i]);
        }
      }
    }
  };

  // Click handler inside editor to detect image selection
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImg(target as HTMLImageElement);
    } else {
      setSelectedImg(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 32, 74, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 990,
        }}
      />

      {/* Sidebar container */}
      <div
        className="fade-in"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '550px',
          maxWidth: '90vw',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 995,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-main)',
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Study Workspace
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-main)',
          }}
        >
          <button
            onClick={() => setActiveTab('content')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              backgroundColor: activeTab === 'content' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'content' ? '2px solid var(--color-secondary)' : 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: activeTab === 'content' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              flex: 1,
              padding: '1rem',
              border: 'none',
              backgroundColor: activeTab === 'notes' ? '#ffffff' : 'transparent',
              borderBottom: activeTab === 'notes' ? '2px solid var(--color-secondary)' : 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: activeTab === 'notes' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all var(--transition-fast)',
            }}
          >
            Notes
          </button>
        </div>

        {/* Tab body content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* TABS 1: DOCUMENTS */}
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* File Previewer view */}
              {activeFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                      Preview: {activeFile.name}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setActiveFile(null)}>Close Preview</Button>
                  </div>
                  
                  {activeFile.type === 'application/pdf' ? (
                    <iframe
                      src={getFileBlobUrl(activeFile.data)}
                      width="100%"
                      height="380px"
                      style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                    />
                  ) : (
                    <Card style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)' }}>
                      <FileText size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
                      <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Word Document Viewer is not natively supported in browser.</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Please download the file to view its full details.</p>
                      <a
                        href={getFileBlobUrl(activeFile.data)}
                        download={activeFile.name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: 'var(--color-primary)',
                          color: '#ffffff',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} /> Download File
                      </a>
                    </Card>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Default Documents section */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                      Official Study Guides
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={18} style={{ color: 'var(--color-secondary)' }} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rules of Procedure</span>
                        </div>
                        <a href="/resources/rules_of_procedure.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)' }}>VIEW</a>
                      </div>

                      {delegateReg?.committee && delegateReg?.committee !== 'NOT ASSIGNED' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} style={{ color: 'var(--color-secondary)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Background Guide ({delegateReg.committee.toUpperCase()})</span>
                          </div>
                          <a href={`/resources/${delegateReg.committee.toLowerCase()}_background_guide.pdf`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)' }}>VIEW</a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Documents List */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
                        Your Research Uploads
                      </h4>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'var(--color-bg-main)' }}>
                        <Plus size={12} /> Upload
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {files.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: '2rem 0' }}>
                        No files uploaded yet. Add PDFs or Word files to review them side-by-side with your notes.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {files.map((file) => (
                          <div
                            key={file.id}
                            onClick={() => setActiveFile(file)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1rem',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#ffffff',
                              cursor: 'pointer',
                              transition: 'box-shadow var(--transition-fast)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <FileText size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file.name}
                              </span>
                            </div>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteFile(file.id, e);
                               }}
                               style={{
                                 background: 'none',
                                 border: 'none',
                                 color: '#c62828',
                                 cursor: 'pointer',
                                 padding: '6px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 borderRadius: 'var(--radius-sm)'
                               }}
                               onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(198, 40, 40, 0.1)'}
                               onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                             >
                               <Trash2 size={14} />
                             </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABS 2: NOTES */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {activeNoteId ? (
                // Note Editor Workspace view
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Note Title..."
                      style={{
                        flex: 1,
                        border: 'none',
                        borderBottom: '2px solid var(--color-border)',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        padding: '0.25rem 0',
                        outline: 'none',
                      }}
                      onFocus={(e) => e.target.style.borderBottomColor = 'var(--color-secondary)'}
                      onBlur={(e) => e.target.style.borderBottomColor = 'var(--color-border)'}
                    />
                    <Button variant="outline" size="sm" onClick={() => setActiveNoteId(null)}>Back to Notes</Button>
                  </div>

                  {saveSuccessMsg && (
                    <div style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
                      Note saved successfully!
                    </div>
                  )}

                  {/* Rich Text Editor Toolbars */}
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      alignItems: 'center',
                      backgroundColor: 'var(--color-bg-main)'
                    }}
                  >
                    {/* Basic Styling Buttons */}
                    <button type="button" onClick={() => executeFormat('bold')} title="Bold" style={toolbarBtnStyle}><Bold size={14} /></button>
                    <button type="button" onClick={() => executeFormat('italic')} title="Italic" style={toolbarBtnStyle}><Italic size={14} /></button>
                    <button type="button" onClick={() => executeFormat('underline')} title="Underline" style={toolbarBtnStyle}><Underline size={14} /></button>
                    <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--color-border)' }} />

                    {/* Font Dropdown (12 font choices) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Type size={13} style={{ color: 'var(--color-text-muted)' }} />
                      <select
                        value={currentFont}
                        onChange={(e) => {
                          setCurrentFont(e.target.value);
                          applyCustomFormat('fontFamily', e.target.value);
                        }}
                        style={selectStyle}
                      >
                        <option value="Helvetica">Helvetica</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Futura">Futura</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Calibri">Calibri</option>
                      </select>
                    </div>

                    {/* Font Sizes (12px to 90px) */}
                    <select
                      value={currentSize}
                      onChange={(e) => {
                        setCurrentSize(e.target.value);
                        applyCustomFormat('fontSize', e.target.value);
                      }}
                      style={selectStyle}
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                      <option value="28px">28px</option>
                      <option value="32px">32px</option>
                      <option value="36px">36px</option>
                      <option value="48px">48px</option>
                      <option value="60px">60px</option>
                      <option value="72px">72px</option>
                      <option value="90px">90px</option>
                    </select>

                    <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--color-border)' }} />

                    {/* Color selector picker (black, yellow, green, red, purple) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Palette size={13} style={{ color: 'var(--color-text-muted)' }} />
                      <select
                        value={currentColor}
                        onChange={(e) => {
                          setCurrentColor(e.target.value);
                          applyCustomFormat('color', e.target.value);
                        }}
                        style={{ ...selectStyle, fontWeight: 700, color: currentColor }}
                      >
                        <option value="#000000" style={{ color: '#000000' }}>Black</option>
                        <option value="#e6c200" style={{ color: '#e6c200' }}>Yellow</option>
                        <option value="#2e7d32" style={{ color: '#2e7d32' }}>Green</option>
                        <option value="#c62828" style={{ color: '#c62828' }}>Red</option>
                        <option value="#6a1b9a" style={{ color: '#6a1b9a' }}>Purple</option>
                      </select>
                    </div>
                  </div>

                  {/* Resizing & aspect ratio crop panel for selected image inside contentEditable */}
                  {selectedImg && (
                    <div
                      className="fade-in"
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--color-bg-main)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        Image Settings:
                      </span>
                      <button type="button" onClick={() => { selectedImg.style.width = '25%'; }} style={actionBtnStyle}>25%</button>
                      <button type="button" onClick={() => { selectedImg.style.width = '50%'; }} style={actionBtnStyle}>50%</button>
                      <button type="button" onClick={() => { selectedImg.style.width = '75%'; }} style={actionBtnStyle}>75%</button>
                      <button type="button" onClick={() => { selectedImg.style.width = '100%'; }} style={actionBtnStyle}>100%</button>
                      
                      <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--color-border)' }} />
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedImg.style.aspectRatio === '1 / 1') {
                            selectedImg.style.aspectRatio = '';
                            selectedImg.style.objectFit = '';
                          } else {
                            selectedImg.style.aspectRatio = '1 / 1';
                            selectedImg.style.objectFit = 'cover';
                          }
                        }}
                        style={actionBtnStyle}
                      >
                        Crop 1:1
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          selectedImg.remove();
                          setSelectedImg(null);
                        }}
                        style={{ ...actionBtnStyle, color: 'var(--color-error)' }}
                      >
                        Delete
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedImg(null)}
                        style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Main contentEditable Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onClick={handleEditorClick}
                    style={{
                      minHeight: '340px',
                      maxHeight: '55vh',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      overflowY: 'auto',
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      fontFamily: currentFont,
                    }}
                  />

                  {/* Save note trigger button */}
                  <Button variant="secondary" size="md" onClick={handleSaveNote} style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <Save size={16} /> Save Notes
                  </Button>
                </div>
              ) : (
                // Notes List view
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
                      My Note Files
                    </h4>
                    <Button variant="secondary" size="sm" onClick={handleCreateNewNote} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Plus size={12} /> New Note
                    </Button>
                  </div>

                  {notes.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', margin: '2rem 0' }}>
                      No saved notes yet. Click "New Note" to start writing draft materials and resolution proposals!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {notes.map((note) => {
                        let touchTimeout: any = null;
                        return (
                          <div
                            key={note.id}
                            onClick={() => {
                              if (renamingNoteId !== note.id) {
                                handleOpenNote(note);
                              }
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setRenamingNoteId(note.id);
                              setRenamingTitle(note.title);
                            }}
                            onTouchStart={() => {
                              touchTimeout = setTimeout(() => {
                                setRenamingNoteId(note.id);
                                setRenamingTitle(note.title);
                              }, 600);
                            }}
                            onTouchEnd={() => {
                              if (touchTimeout) clearTimeout(touchTimeout);
                            }}
                            onTouchMove={() => {
                              if (touchTimeout) clearTimeout(touchTimeout);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1rem',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#ffffff',
                              cursor: 'pointer',
                              transition: 'box-shadow var(--transition-fast)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                              {renamingNoteId === note.id ? (
                                <input
                                  type="text"
                                  value={renamingTitle}
                                  onChange={(e) => setRenamingTitle(e.target.value)}
                                  onBlur={() => handleSaveRename(note)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename(note);
                                    if (e.key === 'Escape') setRenamingNoteId(null);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                  style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)',
                                    border: '1px solid var(--color-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '2px 6px',
                                    outline: 'none',
                                    width: '90%',
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {note.title}
                                </span>
                              )}
                              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                                Last saved: {new Date(note.updatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id, e);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#c62828',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-sm)'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(198, 40, 40, 0.1)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                             >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Styling helper variables
const toolbarBtnStyle = {
  background: 'none',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-primary)',
  transition: 'background-color 0.2s',
  outline: 'none',
};

const selectStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '3px 6px',
  fontSize: '0.72rem',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  outline: 'none',
};

const actionBtnStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 8px',
  fontSize: '0.72rem',
  fontWeight: 700,
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  color: 'var(--color-primary)',
  transition: 'all 0.15s',
};
