import React, { useState } from 'react';
import {
  FolderPlus,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Send,
  Layers,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import type { ClassInfo, Student, CustomGroup, CustomGroupTarget, AppPage } from '../types';

interface CustomGroupsPageProps {
  classes: ClassInfo[];
  students: Student[];
  customGroups: CustomGroup[];
  onCreateCustomGroup: (group: CustomGroup) => void;
  onUpdateCustomGroup: (group: CustomGroup) => void;
  onDeleteCustomGroup: (id: string) => void;
  onNavigate: (page: AppPage) => void;
}

export const CustomGroupsPage: React.FC<CustomGroupsPageProps> = ({
  classes,
  students,
  customGroups,
  onCreateCustomGroup,
  onUpdateCustomGroup,
  onDeleteCustomGroup,
  onNavigate,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSectionId, setSelectedSectionId] = useState(classes[0]?.sections[0]?.id || '');
  const [stagedTargets, setStagedTargets] = useState<CustomGroupTarget[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAppendGroupId, setQuickAppendGroupId] = useState(customGroups[0]?.id || '');
  const [quickAppendSuccess, setQuickAppendSuccess] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const sections = currentClass?.sections || [];

  const handleClassChange = (clsId: string) => {
    setSelectedClassId(clsId);
    const cls = classes.find((c) => c.id === clsId);
    if (cls && cls.sections.length > 0) {
      setSelectedSectionId(cls.sections[0].id);
    } else {
      setSelectedSectionId('');
    }
  };

  const calculateTargetStudentCount = (target: CustomGroupTarget) => {
    return students.filter((s) => {
      const clsMatch = s.className.toLowerCase() === target.className.toLowerCase();
      if (!clsMatch) return false;
      if (target.sectionName === 'All Sections') return true;
      return s.section.toLowerCase() === target.sectionName.toLowerCase();
    }).length;
  };

  const calculateGroupStudentCount = (targets: CustomGroupTarget[]) => {
    const matchedStudentIds = new Set<string>();
    targets.forEach((t) => {
      students.forEach((s) => {
        const clsMatch = s.className.toLowerCase() === t.className.toLowerCase();
        if (clsMatch) {
          if (t.sectionName === 'All Sections' || s.section.toLowerCase() === t.sectionName.toLowerCase()) {
            matchedStudentIds.add(s.id);
          }
        }
      });
    });
    return matchedStudentIds.size;
  };

  const handleAddTarget = () => {
    if (!selectedClassId) return;
    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return;

    let secName = 'All Sections';
    if (selectedSectionId) {
      const sec = cls.sections.find((s) => s.id === selectedSectionId);
      if (sec) secName = sec.name;
    }

    const isDuplicate = stagedTargets.some(
      (t) => t.classId === cls.id && t.sectionId === (selectedSectionId || 'all')
    );

    if (isDuplicate) {
      setErrorMessage(`Target "${cls.name} - ${secName}" is already in this group.`);
      return;
    }

    setErrorMessage('');
    setStagedTargets((prev) => [
      ...prev,
      {
        classId: cls.id,
        className: cls.name,
        sectionId: selectedSectionId || 'all',
        sectionName: secName,
      },
    ]);
  };

  const handleRemoveStagedTarget = (idx: number) => {
    setStagedTargets((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMessage('Please enter a group name.');
      return;
    }
    if (stagedTargets.length === 0) {
      setErrorMessage('Please add at least one Class / Section target.');
      return;
    }

    if (editingGroupId) {
      const updated: CustomGroup = {
        id: editingGroupId,
        name: groupName.trim(),
        targets: stagedTargets,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      onUpdateCustomGroup(updated);
      setEditingGroupId(null);
    } else {
      const newGroup: CustomGroup = {
        id: `cg-${Date.now()}`,
        name: groupName.trim(),
        targets: stagedTargets,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      onCreateCustomGroup(newGroup);
    }

    setGroupName('');
    setStagedTargets([]);
    setErrorMessage('');
  };

  const handleStartEdit = (group: CustomGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setStagedTargets([...group.targets]);
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setGroupName('');
    setStagedTargets([]);
    setErrorMessage('');
  };

  const handleQuickAppend = () => {
    if (!quickAppendGroupId || !selectedClassId) return;
    const targetGroup = customGroups.find((g) => g.id === quickAppendGroupId);
    if (!targetGroup) return;

    const cls = classes.find((c) => c.id === selectedClassId);
    if (!cls) return;

    let secName = 'All Sections';
    if (selectedSectionId) {
      const sec = cls.sections.find((s) => s.id === selectedSectionId);
      if (sec) secName = sec.name;
    }

    const isDuplicate = targetGroup.targets.some(
      (t) => t.classId === cls.id && t.sectionId === (selectedSectionId || 'all')
    );

    if (isDuplicate) {
      setErrorMessage(`"${cls.name} - ${secName}" already belongs to "${targetGroup.name}".`);
      return;
    }

    const updatedTargets = [
      ...targetGroup.targets,
      {
        classId: cls.id,
        className: cls.name,
        sectionId: selectedSectionId || 'all',
        sectionName: secName,
      },
    ];

    onUpdateCustomGroup({
      ...targetGroup,
      targets: updatedTargets,
    });

    setErrorMessage('');
    setQuickAppendSuccess(true);
    setTimeout(() => setQuickAppendSuccess(false), 3000);
  };

  const filteredGroups = customGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.targets.some((t) => t.className.toLowerCase().includes(searchQuery.toLowerCase()) || t.sectionName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Page Head Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight mb-0.5">
            Custom Groups Manager
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            Create and organize multi-class target groups for instant multi-cohort SMS delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('delivery')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Go to SMS Delivery</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Create/Edit Form (Left) & Groups Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left Column: Form Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
            <div className="card-head !mb-1">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
                  <FolderPlus className="w-4 h-4" />
                </span>
                <span>{editingGroupId ? 'Edit Custom Group' : 'Create Custom Group'}</span>
              </h3>
              {editingGroupId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-ink-muted hover:text-ink font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveGroup} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5 select-none block">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Science Fair Attendees, Senior Prefects"
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium outline-none transition-colors"
                />
              </div>

              {/* Target Picker */}
              <div className="p-3.5 bg-surface-2/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-ink block">
                  Add Class &amp; Section Target
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-ink-faint mb-1 block">Class</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full bg-surface border border-gray-200 dark:border-zinc-800 text-ink rounded-xl px-2.5 py-2 text-xs font-medium outline-none cursor-pointer"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-ink-faint mb-1 block">Section</label>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="w-full bg-surface border border-gray-200 dark:border-zinc-800 text-ink rounded-xl px-2.5 py-2 text-xs font-medium outline-none cursor-pointer"
                    >
                      <option value="">All Sections</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddTarget}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-2 text-ink font-semibold text-xs rounded-xl border border-gray-200 dark:border-zinc-800 transition cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Target to Staged List</span>
                </button>
              </div>

              {/* Staged Targets List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-ink-faint select-none block">
                    Staged Targets ({stagedTargets.length})
                  </label>
                  {stagedTargets.length > 0 && (
                    <span className="text-[11px] text-ink-muted">
                      Total ~{calculateGroupStudentCount(stagedTargets)} students
                    </span>
                  )}
                </div>

                {stagedTargets.length === 0 ? (
                  <div className="p-4 bg-surface-2/40 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center text-xs text-ink-muted italic">
                    No targets staged yet. Select a class and click "Add Target".
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {stagedTargets.map((target, idx) => {
                      const count = calculateTargetStudentCount(target);
                      return (
                        <div
                          key={`${target.classId}-${target.sectionId}-${idx}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-surface border border-gray-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-ink">{target.className}</span>
                            <span className="text-ink-faint">&bull;</span>
                            <span className="text-ink-muted">{target.sectionName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2 text-ink-faint font-mono">
                              ~{count}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStagedTarget(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition cursor-pointer"
                            title="Remove target"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1b1e42] hover:bg-[#20224A]/90 dark:bg-accent dark:hover:bg-accent-hover text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingGroupId ? 'Update Group' : 'Save Custom Group'}</span>
              </button>
            </form>
          </div>

          {/* Quick Append Tool Card */}
          {customGroups.length > 0 && (
            <div className="card !p-4 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Append to Existing Group</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink-faint mb-1 block">Target Custom Group</label>
                  <select
                    value={quickAppendGroupId}
                    onChange={(e) => setQuickAppendGroupId(e.target.value)}
                    className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 text-ink rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none cursor-pointer"
                  >
                    {customGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAppend}
                  className="w-full py-2 px-3 rounded-full bg-surface-2 hover:bg-surface-3 text-ink font-semibold text-xs border border-gray-200 dark:border-zinc-800 transition shadow-2xs cursor-pointer active:scale-95"
                >
                  Append Current Selection ({currentClass?.name || 'Class'})
                </button>
                {quickAppendSuccess && (
                  <span className="text-[11px] text-emerald-600 font-semibold block text-center">
                    Added successfully to group!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Groups Directory */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card !p-5 border border-gray-200 dark:border-zinc-800 bg-surface rounded-2xl shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="icon-chip bg-surface-2 text-[#1b1e42] dark:text-accent">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Active Custom Groups</h3>
                  <span className="text-xs text-ink-muted">
                    {customGroups.length} configured target group{customGroups.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Search Groups */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full bg-surface-2 border border-gray-200 dark:border-zinc-800 focus:border-[#1b1e42] dark:focus:border-accent text-ink rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none transition-colors"
                />
              </div>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="p-8 bg-surface-2/30 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-ink-muted space-y-2">
                <FolderPlus className="w-8 h-8 text-ink-faint mx-auto opacity-50" />
                <p className="font-semibold text-ink">No Custom Groups Found</p>
                <p className="text-[11px] text-ink-faint max-w-sm mx-auto">
                  {searchQuery ? 'No custom groups match your search query.' : 'Create your first custom group using the form on the left to start dispatching targeted cohort broadcasts.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGroups.map((group) => {
                  const studentCount = calculateGroupStudentCount(group.targets);
                  const isEditing = editingGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      className={`p-4 rounded-2xl border transition-all ${isEditing
                          ? 'border-[#1b1e42] dark:border-accent bg-surface-2/60 shadow-sm'
                          : 'border-gray-200 dark:border-zinc-800 bg-surface hover:border-gray-300 dark:hover:border-zinc-700 shadow-2xs'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-ink">{group.name}</h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted border border-gray-200 dark:border-zinc-800">
                              {group.createdAt}
                            </span>
                          </div>
                          <span className="text-xs text-ink-muted mt-0.5 block">
                            {group.targets.length} target component{group.targets.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(group)}
                            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-lg transition cursor-pointer"
                            title="Edit group"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCustomGroup(group.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                            title="Delete group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Target Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {group.targets.map((tgt, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-surface-2 text-ink border border-gray-200 dark:border-zinc-800 font-medium flex items-center gap-1"
                          >
                            <span className="font-semibold">{tgt.className}</span>
                            <span className="text-ink-faint">&bull;</span>
                            <span className="text-ink-muted">{tgt.sectionName}</span>
                          </span>
                        ))}
                      </div>

                      {/* Footer Info & Shift CTA */}
                      <div className="pt-2.5 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <Users className="w-3.5 h-3.5" />
                          <span>~{studentCount} Students in group</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate('delivery')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1b1e42] dark:text-accent hover:underline cursor-pointer"
                        >
                          <span>Select in SMS Delivery</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

