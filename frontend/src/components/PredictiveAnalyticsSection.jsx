import React from 'react';

export default function PredictiveAnalyticsSection({ analyticsData, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse mt-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.error || analyticsData.message) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {analyticsData.dashboard_title} - Predictive Analytics
        </h3>
        <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full font-bold">AI Powered</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRINCIPAL / SUPERADMIN */}
        {(analyticsData.role_type === 'Principal' || analyticsData.role_type === 'Superadmin') && (
          <>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">School-wide Enrollment Forecast</h4>
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{analyticsData.enrollment_forecast?.projected_enrollment}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Projected Next Year</div>
                </div>
                <div className={`flex flex-col items-end ${analyticsData.enrollment_forecast?.trend === 'upward' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <div className="font-bold text-xl">+{analyticsData.enrollment_forecast?.growth_rate_pct}%</div>
                  <div className="text-xs">from {analyticsData.enrollment_forecast?.current_enrollment}</div>
                </div>
              </div>

              <h4 className="font-bold text-slate-700 dark:text-slate-300 mt-4">Revenue Projection</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-600 flex flex-col items-center text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Due</div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 mt-1">₱{((analyticsData.revenue_projection?.total_due || 0)/1000).toFixed(0)}k</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-600 flex flex-col items-center text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expected (30d)</div>
                  <div className="font-bold text-green-600 dark:text-green-400 mt-1">₱{((analyticsData.revenue_projection?.next_30_days_expected || 0)/1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">High-Risk Dropouts (AI Flagged)</h4>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {analyticsData.high_risk_dropouts?.map((st, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${st.severity === 'Critical' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{st.student_name} <span className="text-slate-500 font-normal text-sm">({st.grade_level})</span></div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${st.severity === 'Critical' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' : 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50'}`}>{st.severity}</div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"><span className="font-semibold text-slate-700 dark:text-slate-200">Explanation:</span> {st.reason}</div>
                  </div>
                ))}
                {(!analyticsData.high_risk_dropouts || analyticsData.high_risk_dropouts.length === 0) && (
                  <div className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600">No high risk students detected.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* CASHIER */}
        {analyticsData.role_type === 'Cashier' && (
          <>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Collection Risk Forecast</h4>
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{analyticsData.collection_forecast?.collection_rate}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Current Collection Rate</div>
                </div>
                <div className="flex flex-col items-end text-red-600 dark:text-red-400">
                  <div className="font-bold text-xl">₱{((analyticsData.collection_forecast?.overdue_amount || 0)/1000).toFixed(0)}k</div>
                  <div className="text-xs">Total Overdue Risk</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">High-Risk Accounts (AI Flagged)</h4>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {analyticsData.high_risk_accounts?.map((st, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${st.severity === 'Critical' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{st.student_name} <span className="text-slate-500 font-normal text-sm">({st.grade_level})</span></div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${st.severity === 'Critical' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' : 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50'}`}>{st.severity}</div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-1"><span className="font-semibold text-slate-700 dark:text-slate-200">Outstanding:</span> ₱{st.outstanding_balance?.toLocaleString()}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"><span className="font-semibold text-slate-700 dark:text-slate-200">Explanation:</span> {st.reason}</div>
                  </div>
                ))}
                {(!analyticsData.high_risk_accounts || analyticsData.high_risk_accounts.length === 0) && (
                  <div className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600">No high risk accounts detected.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* REGISTRAR */}
        {analyticsData.role_type === 'Registrar' && (
          <>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Enrollment Pipeline</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex flex-col items-center">
                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{analyticsData.enrollment_pipeline?.conversion_rate}%</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">Application Conversion</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex flex-col items-center">
                  <div className="text-3xl font-black text-orange-500 dark:text-orange-400">{analyticsData.enrollment_pipeline?.incomplete_requirements}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1">Incomplete Requirements</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Clearance Bottlenecks (AI Identified)</h4>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {analyticsData.bottlenecks?.map((st, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${st.severity === 'Critical' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{st.student_name}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${st.severity === 'Critical' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' : 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50'}`}>{st.department}</div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"><span className="font-semibold text-slate-700 dark:text-slate-200">Explanation:</span> {st.reason}</div>
                  </div>
                ))}
                {(!analyticsData.bottlenecks || analyticsData.bottlenecks.length === 0) && (
                  <div className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600">No clearance bottlenecks detected.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TEACHER */}
        {analyticsData.role_type === 'Teacher' && (
          <>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Academic Trajectory</h4>
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{analyticsData.academic_trajectory?.class_average}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{analyticsData.academic_trajectory?.section_name} Avg</div>
                </div>
                <div className={`flex flex-col items-end ${analyticsData.academic_trajectory?.trend_forecast === 'Stable' ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                  <div className="font-bold text-lg">{analyticsData.academic_trajectory?.trend_forecast}</div>
                  <div className="text-xs">{analyticsData.academic_trajectory?.student_count} Students</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">At-Risk Students (AI Flagged)</h4>
              <div className="flex flex-col gap-3">
                {analyticsData.at_risk_students?.map((st, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${st.severity === 'Critical' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{st.student_name}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${st.severity === 'Critical' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50' : 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50'}`}>{st.severity}</div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-1"><span className="font-semibold text-slate-700 dark:text-slate-200">Current Score:</span> {st.current_score}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"><span className="font-semibold text-slate-700 dark:text-slate-200">Explanation:</span> {st.reason}</div>
                  </div>
                ))}
                {(!analyticsData.at_risk_students || analyticsData.at_risk_students.length === 0) && (
                  <div className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-600">No at-risk students detected in this section.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
