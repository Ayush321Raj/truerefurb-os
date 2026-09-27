'use client';

import React from 'react';
import { 
  PackageOpen, 
  Cpu, 
  Wrench, 
  Sparkles, 
  CheckCircle, 
  BadgeCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { WorkflowStage } from '@truerefurb/shared-types';

interface PipelineKanbanProps {
  selectedStage: WorkflowStage | 'ALL';
  onSelectStage: (stage: WorkflowStage | 'ALL') => void;
  stageCounts: Record<string, number>;
}

const STAGES: Array<{ id: WorkflowStage; label: string; icon: React.ReactNode; desc: string }> = [
  { id: 'INTAKE', label: '1. Intake & Dock', icon: <PackageOpen size={16} />, desc: 'Serial, IMEI, Blacklist check' },
  { id: 'DIAGNOSTICS', label: '2. Diagnostics', icon: <Cpu size={16} />, desc: 'Sensors, Screen, Battery cycle' },
  { id: 'REPAIR_BENCH', label: '3. Repair Bench', icon: <Wrench size={16} />, desc: 'OEM module swap & soldering' },
  { id: 'CLEANING_POLISH', label: '4. Detail & Polish', icon: <Sparkles size={16} />, desc: 'Ultrasonic wash & UV sterile' },
  { id: 'QA_INSPECTION', label: '5. QA & Grading', icon: <CheckCircle size={16} />, desc: 'Final grading sign-off' },
  { id: 'READY_FOR_SALE', label: '6. Ready for Sale', icon: <BadgeCheck size={16} />, desc: 'Packaged & Channel Sync' },
];

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  selectedStage,
  onSelectStage,
  stageCounts
}) => {
  return (
    <section className="pipeline-section" aria-label="Refurbishment Pipeline Stages">
      <div className="section-header">
        <h2 className="section-title">
          <span>Refurbishment Flow Tracker</span>
          {selectedStage !== 'ALL' && (
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              onClick={() => onSelectStage('ALL')}
            >
              Reset Filter (Show All)
            </button>
          )}
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click a stage below to isolate station batch
        </span>
      </div>

      <div className="pipeline-track" id="pipeline-kanban-track">
        {STAGES.map((st) => {
          const count = stageCounts[st.id] || 0;
          const isActive = selectedStage === st.id;

          return (
            <div
              key={st.id}
              id={`kanban-stage-${st.id.toLowerCase()}`}
              className={`stage-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStage(isActive ? 'ALL' : st.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectStage(isActive ? 'ALL' : st.id); }}
            >
              <div className="stage-card-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {st.icon}
                  {st.label}
                </span>
                <span className="stage-count-badge" style={{ backgroundColor: isActive ? 'var(--accent-cyan)' : undefined, color: isActive ? '#000' : undefined }}>
                  {count}
                </span>
              </div>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
