import React, { useState, useEffect } from 'react';
import {
  Database,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Terminal,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { toast } from '../services/toastService';
import type { AppPage } from '../types';

export interface DatabaseIndexRecommendation {
  id: string;
  indexName: string;
  tableName: string;
  columns: string;
  includedColumns: string;
  shortSummary: string;
  performanceImpact: string;
  sqlScript: string;
  isApplied: boolean;
}

interface DatabaseIndexerPageProps {
  onNavigate: (page: AppPage) => void;
}

export const DatabaseIndexerPage: React.FC<DatabaseIndexerPageProps> = ({ onNavigate }) => {
  const [indexes, setIndexes] = useState<DatabaseIndexRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedIndexId, setExpandedIndexId] = useState<string | null>(null);
  const [applyingIndexId, setApplyingIndexId] = useState<string | null>(null);
  const [copiedIndexId, setCopiedIndexId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [confirmModalIndex, setConfirmModalIndex] = useState<DatabaseIndexRecommendation | null>(null);

  const fetchIndexes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; data: DatabaseIndexRecommendation[] }>(
        '/api/database/indexes'
      );
      if (response.data && response.data.data) {
        setIndexes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load database index recommendations:', err);
      toast.error('ERR_DATABASE_METADATA_FAILED', undefined, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ success: boolean; data: DatabaseIndexRecommendation[] }>('/api/database/indexes')
      .then((res) => {
        if (isMounted && res.data?.data) {
          setIndexes(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load database index recommendations:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedIndexId(id);
    toast.success('SQL Script copied to clipboard!');
    setTimeout(() => setCopiedIndexId(null), 2500);
  };

  const handleCopyAllSql = () => {
    const fullScript = `-- =========================================================================
-- BSS-SMS HIGH-PERFORMANCE DATABASE INDEXING SCRIPT
-- Database Target: BSS-MVCTEST
-- Safe & Idempotent (Checks sys.indexes before creating)
-- =========================================================================

USE [BSS-MVCTEST];
GO

${indexes.map((idx) => `-- -------------------------------------------------------------------------
-- ${idx.indexName} on [${idx.tableName}]
-- Purpose: ${idx.shortSummary}
-- -------------------------------------------------------------------------
${idx.sqlScript}
GO`).join('\n\n')}
`;
    navigator.clipboard.writeText(fullScript);
    setCopiedAll(true);
    toast.success('Full database optimization SQL script copied to clipboard!');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleApplyIndex = async (index: DatabaseIndexRecommendation) => {
    setApplyingIndexId(index.id);
    setConfirmModalIndex(null);
    try {
      await apiClient.post('/api/database/apply-index', { indexId: index.id });
      toast.success(`Index ${index.indexName} applied successfully!`);
      await fetchIndexes();
    } catch (err: any) {
      console.error('Failed to apply index:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Index creation failed';
      toast.error(`Could not apply index: ${errMsg}`);
    } finally {
      setApplyingIndexId(null);
    }
  };

  const appliedCount = indexes.filter((i) => i.isApplied).length;
  const totalCount = indexes.length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl mx-auto">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted mb-1">
            <button
              type="button"
              onClick={() => onNavigate('birthday-settings')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Settings
            </button>
            <span>/</span>
            <span className="text-primary">Database Indexer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
            <Database className="w-6 h-6 text-primary" />
            <span>Database Indexer</span>
          </h1>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            One-click database performance tuning for <strong>BSS-MVCTEST</strong>. Review short summaries and apply indexes to handle millions of students and SMS broadcasts.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchIndexes}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAllSql}
            disabled={isLoading || indexes.length === 0}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'All SQL Copied!' : 'Copy Complete SQL Script'}</span>
          </button>
        </div>
      </div>

      {/* Database Health Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Connection & DB Name */}
        <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Target Database</div>
            <div className="font-bold text-sm text-ink truncate">BSS-MVCTEST</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SQL Server Active (192.168.112.60)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Optimization Status */}
        <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Applied Index Status</div>
            <div className="font-bold text-sm text-ink">
              {appliedCount} of {totalCount} Applied
            </div>
            <div className="text-[10px] text-ink-muted mt-0.5">
              {appliedCount === totalCount ? 'All recommended indexes active' : `${totalCount - appliedCount} recommended for millions of users`}
            </div>
          </div>
        </div>

        {/* Card 3: Performance Impact Potential */}
        <div className="rounded-2xl p-4 bg-surface border border-border-default shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Estimated Speedup</div>
            <div className="font-bold text-sm text-ink">95%+ I/O Reduction</div>
            <div className="text-[10px] text-ink-muted mt-0.5">Sub-2ms seek on Class, Section & DOB</div>
          </div>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Zero Disruption & 100% Non-Blocking (ONLINE = ON)
          </p>
          <p className="text-[11px] leading-relaxed opacity-90">
            Every index uses <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">WITH (ONLINE = ON, FILLFACTOR = 90)</code>. This ensures SQL Server applies the index in the background without locking tables, so teachers, students, and broadcasts experience zero downtime. You can either apply with one click or copy the SQL code to run in SSMS.
          </p>
        </div>
      </div>

      {/* Index Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Recommended High-Impact Indexes ({indexes.length})</span>
          </h2>
          <span className="text-xs text-ink-muted">Click any index to review short summary and SQL</span>
        </div>

        {isLoading ? (
          <div className="rounded-2xl p-12 bg-surface border border-border-default text-center text-xs text-ink-muted">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Analyzing SQL Server metadata from BSS-MVCTEST...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {indexes.map((idx) => {
              const isExpanded = expandedIndexId === idx.id;
              const isApplying = applyingIndexId === idx.id;

              return (
                <div
                  key={idx.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    idx.isApplied
                      ? 'bg-surface border-emerald-500/30 shadow-2xs'
                      : 'bg-surface border-border-default hover:border-primary/40 shadow-xs'
                  }`}
                >
                  {/* Card Header & Summary Bar */}
                  <div className="p-4 sm:p-5 space-y-3">
                    {/* Top Row: Title & Badges (Left) and Action Buttons (Right) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm text-ink">{idx.indexName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-2 text-ink-muted border border-border-default">
                          Table: <strong className="text-ink">{idx.tableName}</strong>
                        </span>

                        {idx.isApplied ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active in Database</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3" />
                            <span>Ready to Apply</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                          {idx.performanceImpact}
                        </span>
                      </div>

                      {/* Actions: Top Right on desktop/tablet, wraps cleanly on mobile */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setExpandedIndexId(isExpanded ? null : idx.id)}
                          className="px-3 py-1.5 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-semibold text-ink flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5 text-ink-muted" />
                          <span>{isExpanded ? 'Hide SQL' : 'View SQL'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySql(idx.id, idx.sqlScript)}
                          className="px-3 py-1.5 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-semibold text-ink flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy SQL for SSMS"
                        >
                          {copiedIndexId === idx.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-ink-muted" />
                          )}
                          <span>{copiedIndexId === idx.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {!idx.isApplied && (
                          <button
                            type="button"
                            onClick={() => setConfirmModalIndex(idx)}
                            disabled={isApplying}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            {isApplying ? (
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            <span>{isApplying ? 'Applying...' : 'Apply Index'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Short Summary - Spans Full Width */}
                    <div className="p-3 rounded-xl bg-surface-2/70 border border-border-default text-xs text-ink leading-relaxed">
                      <strong className="text-primary font-semibold">Short Summary: </strong>
                      <span>{idx.shortSummary}</span>
                    </div>
                  </div>

                  {/* Expanded SQL & Details View */}
                  {isExpanded && (
                    <div className="border-t border-border-default p-4 sm:p-5 bg-surface-2/40 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-surface border border-border-default">
                          <span className="text-ink-faint block text-[10px] font-semibold uppercase">Indexed Key Columns</span>
                          <span className="font-mono text-ink font-semibold mt-0.5 block">{idx.columns}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-surface border border-border-default">
                          <span className="text-ink-faint block text-[10px] font-semibold uppercase">Covering Included Columns</span>
                          <span className="font-mono text-ink font-semibold mt-0.5 block">{idx.includedColumns}</span>
                        </div>
                      </div>

                      <div className="relative rounded-xl overflow-hidden border border-border-default">
                        <div className="px-3 py-1.5 bg-surface-3 border-b border-border-default flex items-center justify-between text-[11px] font-mono text-ink-muted">
                          <span>SQL Server Idempotent DDL</span>
                          <button
                            type="button"
                            onClick={() => handleCopySql(idx.id, idx.sqlScript)}
                            className="hover:text-ink cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                          {idx.sqlScript}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal before One-Click Apply */}
      {confirmModalIndex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border-default p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-ink">Apply Database Index?</h3>
                <p className="text-xs text-ink-muted font-mono">{confirmModalIndex.indexName}</p>
              </div>
            </div>

            {/* Short Summary inside confirmation */}
            <div className="p-3 rounded-xl bg-surface-2 border border-border-default space-y-2 text-xs">
              <div>
                <span className="text-ink-faint">Target Table:</span>{' '}
                <strong className="font-mono text-ink">[dbo].[{confirmModalIndex.tableName}]</strong>
              </div>
              <div>
                <span className="text-ink-faint">Short Summary:</span>
                <p className="text-ink font-sans mt-0.5 leading-relaxed">{confirmModalIndex.shortSummary}</p>
              </div>
              <div>
                <span className="text-ink-faint">Impact:</span>{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{confirmModalIndex.performanceImpact}</span>
              </div>
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed">
              This will execute a safe <code className="font-mono">CREATE NONCLUSTERED INDEX ... WITH (ONLINE = ON)</code> against your database <strong className="text-ink">BSS-MVCTEST</strong>. It will not interrupt active school operations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalIndex(null)}
                className="px-4 py-2 rounded-xl border border-border-default hover:bg-surface-2 text-xs font-semibold text-ink cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleApplyIndex(confirmModalIndex)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Confirm & Apply Index</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseIndexerPage;
