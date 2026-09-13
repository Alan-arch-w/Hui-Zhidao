import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Library, Info } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PolicyCard } from './PolicyCard';
import { POLICIES, POLICY_CATEGORIES } from '../../data/policies';

export const PoliciesView: React.FC = () => {
  const { state, navigateTo } = useApp();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Split into main policies and reference/background policies
  const mainPolicies = useMemo(() => {
    return POLICIES.filter((p) => p.id !== 'P006' && p.id !== 'P009');
  }, []);

  const referencePolicies = useMemo(() => {
    return POLICIES.filter((p) => p.id === 'P006' || p.id === 'P009');
  }, []);

  // Filter main policies
  const filteredMain = useMemo(() => {
    return mainPolicies.filter((p) => {
      const categoryMatch = activeCategory === '全部' || p.category === activeCategory;
      const keywordMatch =
        searchKeyword === '' ||
        p.name.includes(searchKeyword) ||
        p.keywords.some((k) => k.includes(searchKeyword)) ||
        p.target.includes(searchKeyword);
      return categoryMatch && keywordMatch;
    });
  }, [mainPolicies, activeCategory, searchKeyword]);

  // Get match level for a policy
  const getMatchLevel = (policyId: string) => {
    const result = state.matchResults.find((r) => r.policyId === policyId);
    return result;
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigateTo('chat')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-3 md:py-1.5 md:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            返回对话
          </button>
          <div className="h-4 w-px bg-slate-200 md:h-5" />
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-[#2e7066]" />
            <h1 className="text-base font-semibold text-slate-800 md:text-lg">政策库</h1>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {POLICIES.length} 条政策
          </span>
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索政策名称、关键词、适用对象..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors focus:border-[#2e7066] focus:bg-white"
          />
        </div>

        {/* Category filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {POLICY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#2e7066] text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Main policies */}
          {filteredMain.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {filteredMain.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    matchResult={getMatchLevel(policy.id)}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Search className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm">未找到匹配的政策</p>
            </div>
          )}

          {/* Reference / background policies */}
          {(activeCategory === '全部' || activeCategory === '规范指导') && searchKeyword === '' && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-500">政策参考</h3>
              </div>
              <div className="space-y-3">
                {referencePolicies.map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} isReference />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
