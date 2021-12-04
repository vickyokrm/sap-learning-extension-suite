using { riskmanagement as rm } from '../db/schema';

@path: 'Service/risk'
service RiskService {
entity Risks as projection on rm.Risks;
    annotate Risks with @odata.draft.enabled;
    
entity Mitigations as projection on rm.Mitigations;
    annotate Mitigations with @odata.draft.enabled;
}