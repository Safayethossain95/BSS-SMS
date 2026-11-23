import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  Database,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { gatewayService } from '../services/gatewayService';
import { toast } from '../services/toastService';
import type {
  SmsGateway,
  GatewayPreset,
  SaveSmsGatewayPayload,
  GatewayConnectivityResult,
} from '../types/api';
import type { AuthUser } from '../types';

interface SmsGatewayPageProps {
  onGatewayChanged?: () => void;
  user?: AuthUser | null;
}

const GATEWAY_SETUP_SQL = `-- ==============================================================================
-- Table: BSS_SMS_GATEWAY_SETUP
-- Target Database: BSS-MVCTEST (192.168.112.60)
-- Purpose: SMS Gateway Provider Configuration & Routing (Greenweb, BulkSMSBD, etc.)
-- ==============================================================================

USE [BSS-MVCTEST];
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BSS_SMS_GATEWAY_SETUP]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BSS_SMS_GATEWAY_SETUP] (
        [SMS_SETUP_ID]      INT           NOT NULL,
        [GateWayType]       INT           NOT NULL,
        [URL]               NVARCHAR(500) NULL,
        [USER_ID]           NVARCHAR(150) NULL,
        [PASSWORD]          NVARCHAR(250) NULL,
        [API_TOKEN]         NVARCHAR(500) NULL,
        [SID]               NVARCHAR(100) NULL,
        [STATUS]            BIT           NOT NULL DEFAULT 0,
        [MASK_TYPE]         INT           NULL DEFAULT 0,
        [ATTRIBUTE1]        NVARCHAR(500) NULL, -- Provider Name
        [ATTRIBUTE2]        NVARCHAR(50)  NULL, -- HTTP Method (GET/POST)
        [ATTRIBUTE3]        NVARCHAR(MAX) NULL, -- Request Payload Template
        [ATTRIBUTE4]        NVARCHAR(500) NULL, -- Balance URL
        [ATTRIBUTE5]        NVARCHAR(500) NULL, -- Extra Metadata
        [CREATED_BY]        BIGINT        NULL,
        [CREATION_DATE]     DATETIME      NOT NULL DEFAULT GETDATE(),
        [LAST_UPDATE_BY]    BIGINT        NULL,
        [LAST_UPDATE_DATE]  DATETIME      NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_BSS_SMS_GATEWAY_SETUP] PRIMARY KEY CLUSTERED ([SMS_SETUP_ID] ASC)
    );

    CREATE NONCLUSTERED INDEX [IX_BSS_SMS_GATEWAY_SETUP_STATUS]
        ON [dbo].[BSS_SMS_GATEWAY_SETUP] ([STATUS]);
    
    PRINT 'Created table: BSS_SMS_GATEWAY_SETUP';
END;
GO

-- Seed Greenweb BD as default configured gateway
IF NOT EXISTS (SELECT 1 FROM [dbo].[BSS_SMS_GATEWAY_SETUP] WHERE [SMS_SETUP_ID] = 1)
BEGIN
    INSERT INTO [dbo].[BSS_SMS_GATEWAY_SETUP] (
        [SMS_SETUP_ID],
        [GateWayType],
        [URL],
        [API_TOKEN],
        [STATUS],
        [MASK_TYPE],
        [ATTRIBUTE1],
        [ATTRIBUTE2],
        [ATTRIBUTE3],
        [ATTRIBUTE4]
    ) VALUES (
        1,
        1, -- Greenweb
        'http://api.greenweb.com.bd/api.php',
        'YOUR_GREENWEB_TOKEN_HERE',
        1, -- Active
        0, -- Non-masking
        'Greenweb BD',
        'POST',
        '{"token":"{Token}","to":"{Mobile}","message":"{Message}"}',
        'http://api.greenweb.com.bd/grebxml.php?token={Token}&balance'
    );
    PRINT 'Seeded default gateway: Greenweb BD';
END;
GO`;

export const SmsGatewayPage: React.FC<SmsGatewayPageProps> = ({ onGatewayChanged, user }) => {
  // Granular Action Permissions
  const isSuperAdmin = user?.roles?.includes('SuperAdmin') || user?.role?.toLowerCase().includes('admin') || false;
  const canEdit = isSuperAdmin || user?.permissions?.includes('sms.settings.edit') || user?.permissions?.includes('sms.*') || false;
  const canDelete = isSuperAdmin || user?.permissions?.includes('sms.settings.delete') || user?.permissions?.includes('sms.*') || false;
  const [gateways, setGateways] = useState<SmsGateway[]>([]);
  const [presets, setPresets] = useState<GatewayPreset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Connectivity Test State per gateway ID (or 'new' for modal)
  const [testingId, setTestingId] = useState<number | 'modal' | null>(null);
  const [connectivityResults, setConnectivityResults] = useState<Record<number, GatewayConnectivityResult>>({});
  const [modalTestResult, setModalTestResult] = useState<GatewayConnectivityResult | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGateway, setEditingGateway] = useState<SmsGateway | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);

  // SQL DDL Modal State
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<SaveSmsGatewayPayload>({
    gatewayType: 1,
    providerName: '',
    url: '',
    userId: '',
    password: '',
    apiToken: '',
    senderId: '',
    isActive: false,
    maskType: 0,
    httpMethod: 'POST',
    requestTemplate: '',
    balanceUrl: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedGateways, fetchedPresets] = await Promise.all([
        gatewayService.getGateways(),
        gatewayService.getPresets(),
      ]);
      setGateways(fetchedGateways);
      setPresets(fetchedPresets);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load SMS gateways.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([gatewayService.getGateways(), gatewayService.getPresets()])
      .then(([fetchedGateways, fetchedPresets]) => {
        if (isMounted) {
          setGateways(fetchedGateways);
          setPresets(fetchedPresets);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load SMS gateways.';
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeGateway = gateways.find((g) => g.isActive);

  // Trigger quick success flash
  const flashSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = (preset?: GatewayPreset) => {
    setEditingGateway(null);
    setModalTestResult(null);
    setShowPassword(false);
    setShowToken(false);

    if (preset) {
      setFormData({
        gatewayType: preset.defaultGatewayType,
        providerName: preset.name,
        url: preset.defaultUrl,
        userId: '',
        password: '',
        apiToken: '',
        senderId: '',
        isActive: false,
        maskType: preset.requiresSenderId ? 1 : 0,
        httpMethod: preset.defaultHttpMethod,
        requestTemplate: preset.defaultTemplate || '',
        balanceUrl: preset.defaultBalanceUrl || '',
      });
    } else {
      setFormData({
        gatewayType: 1,
        providerName: '',
        url: '',
        userId: '',
        password: '',
        apiToken: '',
        senderId: '',
        isActive: false,
        maskType: 0,
        httpMethod: 'POST',
        requestTemplate: '',
        balanceUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (gateway: SmsGateway) => {
    setEditingGateway(gateway);
    setModalTestResult(null);
    setShowPassword(false);
    setShowToken(false);
    setFormData({
      setupId: gateway.setupId,
      gatewayType: gateway.gatewayType,
      providerName: gateway.providerName,
      url: gateway.url,
      userId: gateway.userId || '',
      password: gateway.password || '',
      apiToken: gateway.apiToken || '',
      senderId: gateway.senderId || '',
      isActive: gateway.isActive,
      maskType: gateway.maskType,
      httpMethod: gateway.httpMethod || 'GET',
      requestTemplate: gateway.requestTemplate || '',
      balanceUrl: gateway.balanceUrl || '',
    });
    setIsModalOpen(true);
  };

  // Apply a Preset inside the modal
  const handleSelectPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      providerName: preset.name,
      gatewayType: preset.defaultGatewayType,
      url: preset.defaultUrl,
      httpMethod: preset.defaultHttpMethod,
      requestTemplate: preset.defaultTemplate || '',
      balanceUrl: preset.defaultBalanceUrl || '',
      maskType: preset.requiresSenderId ? 1 : prev.maskType,
    }));
  };

  // Insert placeholder tag into request template
  const handleInsertTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      requestTemplate: prev.requestTemplate ? `${prev.requestTemplate}&${tag}` : tag,
    }));
  };

  // Save Gateway (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url.trim()) {
      setError('Gateway URL is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await gatewayService.saveGateway(formData);
      flashSuccess(
        editingGateway
          ? `SMS Gateway '${formData.providerName || 'ID #' + editingGateway.setupId}' updated successfully.`
          : `New SMS Gateway '${formData.providerName}' created successfully.`
      );
      setIsModalOpen(false);
      await loadData();
      if (onGatewayChanged) onGatewayChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save SMS gateway.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Set Active Gateway
  const handleSetActive = async (gateway: SmsGateway) => {
    if (gateway.isActive) return;

    const confirmSwitch = window.confirm(
      `Are you sure you want to set '${gateway.providerName || 'Gateway #' + gateway.setupId}' as the Active SMS Gateway? All outbound campus SMS will route through this provider.`
    );
    if (!confirmSwitch) return;

    try {
      await gatewayService.activateGateway(gateway.setupId);
      flashSuccess(`'${gateway.providerName || 'Gateway #' + gateway.setupId}' is now the Active SMS Gateway!`);
      await loadData();
      if (onGatewayChanged) onGatewayChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to activate SMS gateway.';
      setError(msg);
    }
  };

  // Delete Gateway
  const handleDelete = async (gateway: SmsGateway) => {
    if (gateway.isActive) {
      toast.warning('WARN_CANNOT_DELETE_ACTIVE_GATEWAY');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete '${gateway.providerName || 'Gateway #' + gateway.setupId}'?`
    );
    if (!confirmDelete) return;

    try {
      await gatewayService.deleteGateway(gateway.setupId);
      flashSuccess(`Gateway #${gateway.setupId} deleted successfully.`);
      await loadData();
      if (onGatewayChanged) onGatewayChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete SMS gateway.';
      setError(msg);
    }
  };

  // Test Connectivity for a saved gateway card
  const handleTestCardConnectivity = async (gateway: SmsGateway) => {
    setTestingId(gateway.setupId);
    try {
      const result = await gatewayService.testConnectivity({
        setupId: gateway.setupId,
        url: gateway.url,
        httpMethod: gateway.httpMethod,
        apiToken: gateway.apiToken,
        userId: gateway.userId,
        password: gateway.password,
        senderId: gateway.senderId,
      });
      setConnectivityResults((prev) => ({ ...prev, [gateway.setupId]: result }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure during test.';
      setConnectivityResults((prev) => ({
        ...prev,
        [gateway.setupId]: {
          success: false,
          statusCode: 0,
          latencyMs: 0,
          statusMessage: msg,
          rawResponse: msg,
          checkedAt: new Date().toISOString(),
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Test Connectivity inside Modal
  const handleTestModalConnectivity = async () => {
    if (!formData.url.trim()) {
      toast.warning('WARN_GATEWAY_URL_REQUIRED');
      return;
    }
    setTestingId('modal');
    setModalTestResult(null);
    try {
      const result = await gatewayService.testConnectivity({
        setupId: formData.setupId,
        url: formData.url,
        httpMethod: formData.httpMethod,
        apiToken: formData.apiToken,
        userId: formData.userId,
        password: formData.password,
        senderId: formData.senderId,
      });
      setModalTestResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network test error.';
      setModalTestResult({
        success: false,
        statusCode: 0,
        latencyMs: 0,
        statusMessage: msg,
        rawResponse: msg,
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif italic font-bold text-ink tracking-tight">
                SMS Gateway Settings
              </h1>
              <p className="text-xs text-ink-muted">
                Configure any Bangladeshi SMS API provider, test live server reachability, and update active routing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 cursor-pointer"
            title="Refresh gateways"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => handleOpenCreate()}
              className="btn-primary text-xs flex items-center gap-1.5 px-3.5 py-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Gateway</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-2xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium truncate">{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {error.includes('BSS_SMS_GATEWAY_SETUP') && (
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-semibold text-[11px] hover:opacity-90 transition cursor-pointer"
              >
                View Table SQL Script
              </button>
            )}
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-amber-700 dark:text-amber-300 hover:underline text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Gateway Spotlight Banner */}
      {activeGateway ? (
        <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-700/50">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Current Active SMS Gateway
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono bg-white/10 text-white/80">
                  ID #{activeGateway.setupId}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] bg-indigo-500/30 text-indigo-200">
                  {activeGateway.gatewayTypeName}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] bg-white/10 text-white/80">
                  {activeGateway.maskType === 1 ? 'Masking Approved' : 'Non-Masking Route'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {activeGateway.providerName}
                  {activeGateway.senderId && (
                    <span className="text-xs font-mono font-normal text-indigo-300 bg-white/10 px-2 py-0.5 rounded">
                      SID: {activeGateway.senderId}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-indigo-200/80 font-mono mt-0.5 break-all">
                  [{activeGateway.httpMethod}] {activeGateway.url}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => handleTestCardConnectivity(activeGateway)}
                disabled={testingId === activeGateway.setupId}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-300 ${testingId === activeGateway.setupId ? 'animate-bounce' : ''}`} />
                <span>
                  {testingId === activeGateway.setupId ? 'Testing Reachability...' : 'Check Connectivity'}
                </span>
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleOpenEdit(activeGateway)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Configuration</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Gateway Live Test Feedback */}
          {connectivityResults[activeGateway.setupId] && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs flex-wrap gap-2 text-indigo-100">
              <div className="flex items-center gap-2">
                {connectivityResults[activeGateway.setupId].success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{connectivityResults[activeGateway.setupId].statusMessage}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-white/80">
                <span className="px-2 py-0.5 rounded bg-black/30">
                  HTTP {connectivityResults[activeGateway.setupId].statusCode}
                </span>
                <span className="px-2 py-0.5 rounded bg-black/30 text-amber-300">
                  ⚡ {connectivityResults[activeGateway.setupId].latencyMs} ms
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>No Active SMS Gateway Selected!</strong> Outbound messages will default to simulated mode until an active gateway is chosen.
            </span>
          </div>
        </div>
      )}

      {/* 3. Bangladeshi SMS Provider Presets (1-Click Fill) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bangladeshi SMS Provider Presets (1-Click Setup)</span>
          </h3>
          <span className="text-[11px] text-ink-faint">
            Click any provider to open pre-filled setup
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleOpenCreate(preset)}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between"
              title={preset.description}
            >
              <div>
                <div className="text-[11.5px] font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-ink-muted truncate mt-0.5 font-mono">
                  {preset.defaultHttpMethod}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                <span>Setup</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Configured SMS Gateways List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Configured Gateways ({gateways.length})</span>
          </h3>
          <span className="text-[11px] text-ink-faint font-mono">
            Directly synced with SQL Server BSS_SMS_GATEWAY_SETUP
          </span>
        </div>

        {gateways.length === 0 ? (
          <div className="rounded-2xl p-8 bg-surface border border-dashed border-border-default text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-xs">
              <Database className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-ink">Table BSS_SMS_GATEWAY_SETUP Not Initialized</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                The database table for SMS gateways has not been created yet in SQL Server (<strong className="text-ink">BSS-MVCTEST</strong>). Review the SQL script below to create the table, or use any preset above to configure your gateway.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-ink text-xs font-semibold border border-border-default flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span>View Table SQL Script</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreate(presets[0])}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Gateway</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {gateways.map((gw) => {
            const result = connectivityResults[gw.setupId];
            const isTesting = testingId === gw.setupId;

            return (
              <div
                key={gw.setupId}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  gw.isActive
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 shadow-xs ring-1 ring-indigo-400/20'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-2xs'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Status & ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {gw.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-zinc-800 text-ink-muted">
                          Inactive
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-ink-faint">
                        #{gw.setupId}
                      </span>
                    </div>

                    <span className="text-[10.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted">
                      {gw.httpMethod}
                    </span>
                  </div>

                  {/* Provider Name & URL */}
                  <div>
                    <h4 className="text-sm font-bold text-ink truncate leading-tight">
                      {gw.providerName}
                    </h4>
                    <p className="text-[11px] font-mono text-ink-muted truncate mt-0.5" title={gw.url}>
                      {gw.url}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted">
                      {gw.gatewayTypeName}
                    </span>
                    {gw.senderId && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono">
                        SID: {gw.senderId}
                      </span>
                    )}
                    {gw.userId && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted font-mono">
                        User: {gw.userId}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-surface-2 text-ink-faint">
                      {gw.maskType === 1 ? 'Masking' : 'Non-Masking'}
                    </span>
                  </div>

                  {/* Real-time Connectivity Badge (if tested) */}
                  {result && (
                    <div
                      className={`p-2 rounded-lg text-[11px] space-y-1 ${
                        result.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1">
                          {result.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          HTTP {result.statusCode}
                        </span>
                        <span className="font-mono text-[10px]">
                          ⚡ {result.latencyMs} ms
                        </span>
                      </div>
                      <div className="text-[10.5px] truncate font-mono text-ink-muted">
                        {result.statusMessage}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTestCardConnectivity(gw)}
                    disabled={isTesting}
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                    title="Ping SMS Gateway server"
                  >
                    <Zap className={`w-3 h-3 text-amber-500 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {!gw.isActive && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(gw)}
                        className="px-2 py-1 text-[11px] rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold transition cursor-pointer"
                        title="Set as Active Gateway"
                      >
                        Set Active
                      </button>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(gw)}
                        className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-lg transition cursor-pointer"
                        title="Edit Gateway"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!gw.isActive && canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(gw)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                        title="Delete Gateway"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* 5. Create / Edit Gateway Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
            {/* Modal Header (Fixed at top) */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    {editingGateway ? `Edit Gateway #${editingGateway.setupId}` : 'Add New SMS Gateway'}
                  </h3>
                  <p className="text-[11px] text-ink-muted leading-tight">
                    Configure endpoint, authentication credentials, and request format for Bangladesh SMS delivery.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-ink-muted hover:text-ink transition cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Container with Sticky/Fixed Footer */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0 bg-white dark:bg-zinc-900">
              {/* Scrollable Form Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-zinc-900">
                {/* Preset Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Load Bangladeshi Provider Preset (Optional)
                  </label>
                  <select
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    defaultValue=""
                    className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                  >
                    <option value="" disabled>-- Select preset to prefill fields --</option>
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.defaultHttpMethod} - {p.defaultUrl.slice(0, 35)}...)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provider Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Provider / Gateway Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.providerName}
                      onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                      placeholder="e.g. Greenweb BD, Alpha SMS"
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gateway Dispatch Type *
                    </label>
                    <select
                      value={formData.gatewayType}
                      onChange={(e) => setFormData({ ...formData, gatewayType: parseInt(e.target.value, 10) })}
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    >
                      <option value={1}>Type 1: User-Based / Token (GET/POST)</option>
                      <option value={2}>Type 2: API Token (JSON POST - SSL Wireless)</option>
                      <option value={3}>Type 3: RT Communications</option>
                      <option value={4}>Type 4: Custom BD SMS API Gateway</option>
                    </select>
                  </div>
                </div>

                {/* HTTP Method & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      HTTP Method *
                    </label>
                    <select
                      value={formData.httpMethod}
                      onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gateway API Endpoint URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://api.sms.net.bd/sendsms or http://api.greenweb.com.bd/api.php"
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* Credentials: User ID, Password, API Token, Sender ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      API Token / Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={formData.apiToken || ''}
                        onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                        placeholder="e.g. S3bQWkFWipb7rc..."
                        className="w-full text-xs p-2.5 pr-9 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Sender ID / Masking SID
                    </label>
                    <input
                      type="text"
                      value={formData.senderId || ''}
                      onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                      placeholder="e.g. BSS, 8809610935120"
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      User ID / Account Code (acode)
                    </label>
                    <input
                      type="text"
                      value={formData.userId || ''}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      placeholder="e.g. 30000273 or it@school.com"
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Password / Auth Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Password (if provider requires)"
                        className="w-full text-xs p-2.5 pr-9 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Masking Route & Balance URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Masking Route Type
                    </label>
                    <select
                      value={formData.maskType}
                      onChange={(e) => setFormData({ ...formData, maskType: parseInt(e.target.value, 10) })}
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    >
                      <option value={0}>0 - Non-Masking (Numeric Sender)</option>
                      <option value={1}>1 - Masking (Brand Name Sender)</option>
                      <option value={2}>2 - Fixed Masking SID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Balance Check URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.balanceUrl || ''}
                      onChange={(e) => setFormData({ ...formData, balanceUrl: e.target.value })}
                      placeholder="e.g. https://api.sms.net.bd/user/balance?api_key={token}"
                      className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                {/* Custom Request Template / Query Form */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Request Template / Payload Tags (Optional)
                    </label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {['{mobile}', '{message}', '{token}', '{senderId}', '{userId}'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertTag(tag)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-ink-muted hover:text-indigo-600 font-mono transition cursor-pointer border border-gray-200 dark:border-zinc-700"
                          title={`Insert ${tag}`}
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.requestTemplate || ''}
                    onChange={(e) => setFormData({ ...formData, requestTemplate: e.target.value })}
                    placeholder="e.g. token={token}&to={mobile}&message={message} or JSON template"
                    className="w-full text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-ink font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden transition-colors"
                  />
                </div>

                {/* Set Active Checkbox */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-ink">Set as Active SMS Gateway</div>
                    <div className="text-[10.5px] text-ink-muted">
                      If checked, this gateway will immediately handle all broadcast dispatches.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Modal Live Connectivity Test Result */}
                {modalTestResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                      modalTestResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        {modalTestResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        HTTP {modalTestResult.statusCode} Response
                      </span>
                      <span className="font-mono text-[11px]">⚡ {modalTestResult.latencyMs} ms latency</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{modalTestResult.statusMessage}</p>
                    {modalTestResult.rawResponse && (
                      <div className="mt-1 p-2 rounded-lg bg-black/5 dark:bg-black/40 font-mono text-[10px] break-all max-h-24 overflow-y-auto">
                        {modalTestResult.rawResponse}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions (FIXED DOCKED AT BOTTOM - ALWAYS VISIBLE) */}
              <div className="px-5 py-3.5 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/90 flex items-center justify-between gap-3 shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={handleTestModalConnectivity}
                  disabled={testingId === 'modal'}
                  className="btn-secondary text-xs flex items-center gap-1.5 px-3.5 py-2 cursor-pointer disabled:opacity-50"
                  title="Check reachability to this gateway URL without saving"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-500 ${testingId === 'modal' ? 'animate-bounce' : ''}`} />
                  <span>{testingId === 'modal' ? 'Testing Reachability...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary text-xs px-4 py-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary text-xs flex items-center gap-1.5 px-4.5 py-2 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{editingGateway ? 'Update Gateway' : 'Save Gateway'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SQL Script View & Copy Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">BSS_SMS_GATEWAY_SETUP DDL Script</h3>
                  <p className="text-[11px] text-ink-muted">Run this script in SQL Server Management Studio (SSMS) on BSS-MVCTEST</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-zinc-950 text-zinc-100 font-mono text-xs rounded-none">
              <pre className="whitespace-pre-wrap leading-relaxed select-all">
                {GATEWAY_SETUP_SQL}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-850 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-ink-muted">Target: server=192.168.112.60 &bull; Database=BSS-MVCTEST</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(GATEWAY_SETUP_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="btn-primary text-xs flex items-center gap-1.5 px-4 py-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsGatewayPage;
