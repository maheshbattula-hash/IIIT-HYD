import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Database,
  ArrowRight,
  Sparkles,
  GitMerge,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

export const DataQualityPage: React.FC = () => {
  const [dataQuality, setDataQuality] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'DEDUPLICATION' | 'CONTRACT'>('METRICS');

  useEffect(() => {
    async function loadDQ() {
      setLoading(true);
      try {
        const res = await api.getDataQuality();
        setDataQuality(res);
      } catch (err) {
        console.error('Failed to load data quality:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDQ();
  }, []);

  if (loading || !dataQuality) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-slate-500">Loading Data Quality Observability Center...</p>
        </div>
      </div>
    );
  }

  const { summary, qualityDimensions, duplicateClusters, validationRules, dataContract } = dataQuality;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Quality & Observability Center</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Layer 1 Data Product Factory
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring data cleanliness, deduplication survivorship, schema drift, and formal Data Contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Overall Score: {summary.overallQualityScore}% (Healthy)</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { id: 'METRICS', label: 'Quality Dimensions & Validation Matrix' },
          { id: 'DEDUPLICATION', label: 'Identity Resolution & Duplicate Clusters' },
          { id: 'CONTRACT', label: 'Data Product Contract Specification' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700 bg-teal-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: METRICS */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          {/* Quality Dimensions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {qualityDimensions.map((dim: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{dim.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {dim.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {dim.score}%
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${dim.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{dim.description}</p>
              </div>
            ))}
          </div>

          {/* Validation Rules Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Automated Quality Validation Rules</h3>
            <p className="text-xs text-slate-500 mb-4">Continuous schema validation and domain constraint assertions</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Rule ID</th>
                    <th className="p-3">Rule Description</th>
                    <th className="p-3">Dimension</th>
                    <th className="p-3">Target Dataset</th>
                    <th className="p-3">Passing %</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {validationRules.map((rule: any) => (
                    <tr key={rule.ruleId} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-teal-800">{rule.ruleId}</td>
                      <td className="p-3 font-sans font-medium text-slate-900">{rule.name}</td>
                      <td className="p-3 font-sans text-slate-600">{rule.dimension}</td>
                      <td className="p-3 text-slate-600">{rule.dataset}</td>
                      <td className="p-3 font-bold text-emerald-700">{rule.passedPercent}%</td>
                      <td className="p-3 font-sans">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Passed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DEDUPLICATION EXPLORER */}
      {activeTab === 'DEDUPLICATION' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Identity Resolution & Survivorship Clusters</h3>
                <p className="text-xs text-slate-500">
                  Visual proof of messy raw records from multiple sources merged into golden customer profiles.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
                {summary.deduplicationRate}
              </span>
            </div>

            <div className="space-y-6">
              {duplicateClusters.map((cluster: any) => (
                <div key={cluster.resolvedCustomerId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">
                        Golden Master: {cluster.resolvedCustomerId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {cluster.recordCount} Raw Feeds Unified
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {(cluster.averageConfidence * 100).toFixed(1)}% Resolution Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cluster.rawSources.map((raw: any) => (
                      <div key={raw.raw_id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-teal-700">{raw.raw_id}</span>
                          <span className="text-slate-400">{raw.source_feed}</span>
                        </div>
                        <div className="text-[11px] text-slate-800 font-sans font-bold">{raw.extracted_name}</div>
                        <div className="text-[11px] text-slate-600">Phone: {raw.extracted_phone}</div>
                        <div className="text-[10px] text-slate-500 font-sans italic bg-slate-50 p-1.5 rounded">
                          {raw.match_reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DATA PRODUCT CONTRACT */}
      {activeTab === 'CONTRACT' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Enterprise Data Contract Specification</h3>
                <p className="text-xs text-slate-500">Version 2.4.0 • Verified schema definition, SLAs, and permitted uses</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                JSON Schema 2020-12
              </span>
            </div>

            {dataContract && (
              <div className="space-y-6">
                {/* Contract Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Product Title</span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{dataContract.info?.title}</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Owner</span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{dataContract.info?.owner}</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">SLA Freshness</span>
                    <div className="text-xs font-bold text-emerald-700 mt-0.5">{dataContract.serviceLevelAgreement?.freshness}</div>
                  </div>
                </div>

                {/* Permitted vs Prohibited Uses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-2">
                      Permitted Operational Uses:
                    </span>
                    <ul className="space-y-1.5 text-xs text-emerald-900">
                      {dataContract.permittedUses?.map((u: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{u}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                    <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block mb-2">
                      Prohibited Operations & Guardrails:
                    </span>
                    <ul className="space-y-1.5 text-xs text-rose-900">
                      {dataContract.prohibitedUses?.map((p: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Raw JSON Schema Preview */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Contract DDL & Schema JSON:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72">
                    <pre>{JSON.stringify(dataContract.schema, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
