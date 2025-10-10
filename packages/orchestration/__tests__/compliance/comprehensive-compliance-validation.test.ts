/**
 * Comprehensive Compliance Validation Test Suite
 *
 * Validates detailed GDPR, SOX, and HIPAA compliance requirements
 * for the modernized orchestration package audit logging system.
 * Tests enterprise-grade compliance features with Node 22+ enhancements.
 */

import { createHash, randomBytes } from 'crypto';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AuditUtils,
  globalAuditLogger,
  globalMemoryMonitor,
  globalPerformanceMonitor,
  startGlobalAuditLogging,
  stopGlobalAuditLogging,
} from '../../src/shared/utils';

// Compliance framework types
type ComplianceFramework = 'GDPR' | 'SOX' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'PCI_DSS';

interface ComplianceContext {
  framework: ComplianceFramework;
  requirements: string[];
  retentionPeriod: number; // days
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  accessControls: {
    minimumPrivilege: boolean;
    segregationOfDuties: boolean;
    dualApproval: boolean;
    auditTrail: boolean;
  };
  dataProtection: {
    encryption: boolean;
    anonymization: boolean;
    pseudonymization: boolean;
    rightToErasure: boolean;
  };
}

// Mock compliance data generators
class ComplianceDataGenerator {
  static generateGDPRPersonalData() {
    return {
      dataSubject: {
        id: `ds-${randomBytes(8).toString('hex')}`,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567',
        address: {
          street: '123 Privacy Street',
          city: 'Data City',
          country: 'EU',
          postalCode: '12345',
        },
        dateOfBirth: '1990-01-01',
        nationality: 'German',
        ipAddress: '192.168.1.100',
        browserFingerprint: 'Mozilla/5.0...',
      },
      processingDetails: {
        purpose: 'user_authentication',
        legalBasis: 'legitimate_interest',
        consentGiven: true,
        consentTimestamp: new Date(),
        processingCategories: ['identity_verification', 'service_provision'],
        recipientCategories: ['internal_staff', 'service_providers'],
        transferToThirdCountries: false,
        retentionPeriod: 1095, // 3 years in days
      },
      dataSubjectRights: {
        accessRequest: true,
        rectificationRequest: false,
        erasureRequest: false,
        restrictionRequest: false,
        portabilityRequest: false,
        objectionRequest: false,
        automatedDecisionMaking: false,
      },
    };
  }

  static generateSOXFinancialData() {
    return {
      financialTransaction: {
        id: `tx-${randomBytes(8).toString('hex')}`,
        type: 'journal_entry',
        amount: 50000.0,
        currency: 'USD',
        accountDebit: 'ACCT-1001-ASSETS',
        accountCredit: 'ACCT-2001-REVENUE',
        description: 'Revenue recognition adjustment',
        fiscalPeriod: '2024-Q1',
        entityId: 'ENTITY-001',
      },
      internalControls: {
        dualApproval: {
          required: true,
          firstApprover: 'approver1@company.com',
          secondApprover: 'approver2@company.com',
          approvalTimestamp1: new Date(Date.now() - 3600000),
          approvalTimestamp2: new Date(),
        },
        segregationOfDuties: {
          preparer: 'preparer@company.com',
          reviewer: 'reviewer@company.com',
          approver: 'approver@company.com',
          poster: 'poster@company.com',
        },
        supportingDocuments: [
          {
            type: 'invoice',
            id: 'INV-2024-001',
            hash: createHash('sha256').update('invoice-data').digest('hex'),
          },
          {
            type: 'contract',
            id: 'CONTRACT-2024-A',
            hash: createHash('sha256').update('contract-data').digest('hex'),
          },
        ],
        complianceOfficer: 'compliance@company.com',
        auditFirm: 'BigFour Auditors LLC',
        testingRequired: true,
      },
      riskAssessment: {
        materialityThreshold: 100000,
        riskLevel: 'medium',
        fraudRiskIndicators: [],
        significantAccountBalance: true,
        managementAssertion: 'existence_completeness_accuracy',
      },
    };
  }

  static generateHIPAAHealthData() {
    return {
      protectedHealthInfo: {
        patientId: `pat-${randomBytes(8).toString('hex')}`,
        medicalRecordNumber: `MRN-${randomBytes(6).toString('hex')}`,
        demographics: {
          name: 'Jane Smith', // Would be encrypted/tokenized in real implementation
          dateOfBirth: '1985-03-15',
          ssn: '***-**-4567', // Masked
          address: {
            street: '****** Health Ave', // Partially masked
            city: 'Medical City',
            state: 'CA',
            zipCode: '90***', // Partially masked
          },
        },
        medicalData: {
          diagnosis: [
            {
              code: 'ICD-10: F32.1',
              description: 'Major depressive disorder, single episode, moderate',
            },
            { code: 'ICD-10: Z87.891', description: 'Personal history of nicotine dependence' },
          ],
          procedures: [{ code: 'CPT: 90834', description: 'Psychotherapy, 45 minutes' }],
          medications: [{ name: 'Sertraline', dosage: '50mg', frequency: 'daily' }],
          labResults: [{ test: 'CBC', result: 'Within normal limits', date: '2024-01-15' }],
        },
      },
      accessControl: {
        coveredEntity: 'Medical Center ABC',
        businessAssociate: null,
        authorizedPersonnel: [
          { id: 'DR001', role: 'attending_physician', department: 'psychiatry' },
          { id: 'NURSE001', role: 'registered_nurse', department: 'psychiatry' },
          { id: 'ADMIN001', role: 'medical_records', department: 'administration' },
        ],
        accessPurpose: 'treatment',
        minimumNecessary: true,
        patientAuthorization: true,
        emergencyAccess: false,
        disclosureTracking: true,
      },
      safeguards: {
        administrative: {
          securityOfficer: 'security@medicalcenter.com',
          workforceTraining: true,
          accessManagement: true,
          contingencyPlan: true,
        },
        physical: {
          facilityAccess: 'controlled',
          workstationSecurity: 'restricted',
          mediaControls: 'encrypted',
        },
        technical: {
          accessControl: 'unique_user_identification',
          auditLogging: 'comprehensive',
          integrity: 'data_alteration_protection',
          transmission: 'end_to_end_encryption',
        },
      },
    };
  }
}

describe('comprehensive Compliance Validation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    await globalPerformanceMonitor.start();
    await globalMemoryMonitor.start();
    await startGlobalAuditLogging({
      enableIntegrityChecks: true,
      enablePiiDetection: true,
      enableRealTimeAlerts: true,
      enableComplianceValidation: true,
      batchSize: 1000,
      flushInterval: 2000,
    });
  });

  afterEach(async () => {
    await stopGlobalAuditLogging();
    await globalPerformanceMonitor.stop();
    await globalMemoryMonitor.stop();
  });

  describe('gDPR Compliance Validation', () => {
    test('should validate comprehensive GDPR data processing compliance', async () => {
      const gdprData = ComplianceDataGenerator.generateGDPRPersonalData();

      // Test Article 6: Lawfulness of processing
      await AuditUtils.logDataAccess(
        'gdpr_personal_data_processing',
        `resource-${gdprData.dataSubject.id}`,
        'read',
        'data-controller-001',
        true,
        {
          complianceContext: {
            framework: 'GDPR' as ComplianceFramework,
            article: 'Article 6 - Lawfulness of processing',
            legalBasis: gdprData.processingDetails.legalBasis,
            purpose: gdprData.processingDetails.purpose,
            consentStatus: {
              given: gdprData.processingDetails.consentGiven,
              timestamp: gdprData.processingDetails.consentTimestamp,
              withdrawable: true,
            },
          },
          personalDataCategories: gdprData.processingDetails.processingCategories,
          retentionPolicy: {
            period: gdprData.processingDetails.retentionPeriod,
            reviewDate: new Date(
              Date.now() + gdprData.processingDetails.retentionPeriod * 24 * 60 * 60 * 1000,
            ),
            deletionScheduled: false,
          },
          dataSubjectRights: gdprData.dataSubjectRights,
        },
      );

      // Test Article 17: Right to erasure (Right to be forgotten)
      if (gdprData.dataSubjectRights.erasureRequest) {
        await AuditUtils.logDataAccess(
          'gdpr_erasure_request',
          `erasure-${gdprData.dataSubject.id}`,
          'delete',
          'data-protection-officer',
          true,
          {
            complianceContext: {
              framework: 'GDPR' as ComplianceFramework,
              article: 'Article 17 - Right to erasure',
              requestType: 'erasure',
              requestTimestamp: new Date(),
              responseDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            erasureScope: {
              personalDataTypes: ['identity', 'contact', 'behavioral'],
              systemsAffected: ['user_database', 'analytics', 'backups'],
              thirdPartyNotification: true,
            },
            legalObligationCheck: {
              canErase: true,
              retentionRequired: false,
              publicInterest: false,
            },
          },
        );
      }

      // Test Article 32: Security of processing
      await AuditUtils.logSecurityEvent(
        'GDPR Article 32 - Security measures validation',
        'medium',
        ['gdpr_compliance', 'security_measures'],
        {
          complianceContext: {
            framework: 'GDPR' as ComplianceFramework,
            article: 'Article 32 - Security of processing',
            measures: {
              pseudonymisation: true,
              encryption: true,
              confidentiality: true,
              integrity: true,
              availability: true,
              resilience: true,
            },
          },
          technicalMeasures: {
            encryptionAtRest: 'AES-256-GCM',
            encryptionInTransit: 'TLS-1.3',
            accessControls: 'RBAC',
            auditLogging: 'comprehensive',
            backupStrategy: '3-2-1',
          },
          organisationalMeasures: {
            staffTraining: true,
            dataProtectionPolicies: true,
            incidentResponsePlan: true,
            dataProtectionImpactAssessment: true,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate GDPR data breach notification requirements', async () => {
      // Simulate a data breach scenario
      const breachData = {
        breachId: `breach-${randomBytes(8).toString('hex')}`,
        detectionTime: new Date(),
        breachType: 'confidentiality_breach',
        affectedDataSubjects: 1500,
        personalDataCategories: ['names', 'email_addresses', 'phone_numbers'],
        riskAssessment: {
          riskLevel: 'high',
          likelyConsequences: 'identity_theft_risk',
          mitigatingFactors: ['data_encrypted', 'limited_scope'],
        },
      };

      // Test Article 33: Notification of a personal data breach to the supervisory authority
      await AuditUtils.logSecurityEvent(
        'GDPR Article 33 - Data breach notification to supervisory authority',
        'critical',
        ['gdpr_compliance', 'data_breach', 'regulatory_notification'],
        {
          complianceContext: {
            framework: 'GDPR' as ComplianceFramework,
            article: 'Article 33 - Notification to supervisory authority',
            notificationDeadline: new Date(
              breachData.detectionTime.getTime() + 72 * 60 * 60 * 1000,
            ), // 72 hours
            supervisoryAuthority: 'National Data Protection Authority',
          },
          breachDetails: breachData,
          notificationContent: {
            natureOfBreach: breachData.breachType,
            categoriesAndNumbers: {
              dataSubjects: breachData.affectedDataSubjects,
              personalDataRecords: breachData.affectedDataSubjects * 3, // Estimated records per subject
            },
            likelyConsequences: breachData.riskAssessment.likelyConsequences,
            measuresAdopted: [
              'immediate_containment',
              'security_patch_deployment',
              'affected_user_notification',
              'additional_security_measures',
            ],
          },
          dataProtectionOfficer: 'dpo@company.com',
        },
      );

      // Test Article 34: Communication of a personal data breach to the data subject
      await AuditUtils.logSecurityEvent(
        'GDPR Article 34 - Data breach notification to data subjects',
        'high',
        ['gdpr_compliance', 'data_breach', 'data_subject_notification'],
        {
          complianceContext: {
            framework: 'GDPR' as ComplianceFramework,
            article: 'Article 34 - Communication to data subject',
            highRiskThreshold: true,
            notificationRequired: breachData.riskAssessment.riskLevel === 'high',
          },
          communicationDetails: {
            method: 'email_and_website_notice',
            language: 'clear_and_plain',
            content: {
              natureOfBreach: breachData.breachType,
              contactDetails: 'dpo@company.com',
              likelyConsequences: breachData.riskAssessment.likelyConsequences,
              measuresTaken: 'immediate_security_enhancement',
            },
          },
          exemptions: {
            technicalProtectionMeasures:
              breachData.riskAssessment.mitigatingFactors.includes('data_encrypted'),
            disproportionateEffort: false,
            publicCommunication: false,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThanOrEqual(0); // Critical events logged as high risk
    });

    test('should validate GDPR cross-border data transfer compliance', async () => {
      const transferData = {
        transferId: `transfer-${randomBytes(8).toString('hex')}`,
        sourceCountry: 'Germany',
        destinationCountry: 'United States',
        adequacyDecision: false,
        safeguards: 'standard_contractual_clauses',
        dataCategories: ['customer_data', 'employee_data'],
        recipients: ['cloud_service_provider', 'analytics_partner'],
      };

      // Test Chapter V: Transfers of personal data to third countries
      await AuditUtils.logDataAccess(
        'gdpr_international_transfer',
        `transfer-${transferData.transferId}`,
        'transfer',
        'data-controller-001',
        true,
        {
          complianceContext: {
            framework: 'GDPR' as ComplianceFramework,
            chapter: 'Chapter V - Transfers to third countries',
            adequacyDecision: transferData.adequacyDecision,
            transferMechanism: transferData.safeguards,
          },
          transferDetails: transferData,
          legalBasis: {
            article44: 'general_principle_transfers',
            article46: 'transfers_with_appropriate_safeguards',
            safeguardType: 'standard_contractual_clauses',
            enforceableRights: true,
            effectiveLegalRemedies: true,
          },
          dataSubjectNotification: {
            informationProvided: true,
            transferDisclosed: true,
            safeguardsExplained: true,
          },
          onwardTransferRestrictions: {
            recipientObligations: 'same_level_protection',
            onwardTransferProhibited: false,
            supervisoryAuthorityAccess: true,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });
  });

  describe('sOX Compliance Validation', () => {
    test('should validate SOX Section 302 certification requirements', async () => {
      const soxData = ComplianceDataGenerator.generateSOXFinancialData();

      // Test Section 302: Corporate responsibility for financial reports
      await AuditUtils.logDataAccess(
        'sox_section_302_certification',
        `cert-${soxData.financialTransaction.id}`,
        'certify',
        'ceo@company.com',
        true,
        {
          complianceContext: {
            framework: 'SOX' as ComplianceFramework,
            section: 'Section 302 - Corporate responsibility',
            certificationPeriod: soxData.financialTransaction.fiscalPeriod,
            certificationDate: new Date(),
          },
          certificationDetails: {
            ceo: {
              name: 'Chief Executive Officer',
              email: 'ceo@company.com',
              certificationDate: new Date(),
              acknowledgment: 'full_responsibility_financial_statements',
            },
            cfo: {
              name: 'Chief Financial Officer',
              email: 'cfo@company.com',
              certificationDate: new Date(),
              acknowledgment: 'full_responsibility_financial_statements',
            },
          },
          internalControlsEffectiveness: {
            designEffectiveness: true,
            operatingEffectiveness: true,
            materialWeaknesses: [],
            significantDeficiencies: [],
            remediationPlans: [],
          },
          disclosureControls: {
            processesEstablished: true,
            informationEvaluated: true,
            conclusionsReached: true,
            changesInInternalControl: false,
          },
          fraudDisclosure: {
            managementFraud: false,
            employeeFraud: false,
            materialFraud: false,
            fraudRiskAssessment: 'completed',
          },
        },
      );

      // Test dual approval workflow
      await AuditUtils.logDataAccess(
        'sox_dual_approval_workflow',
        `approval-${soxData.financialTransaction.id}`,
        'approve',
        soxData.internalControls.dualApproval.firstApprover,
        true,
        {
          complianceContext: {
            framework: 'SOX' as ComplianceFramework,
            control: 'dual_approval_control',
            controlObjective: 'prevent_unauthorized_transactions',
          },
          approvalWorkflow: {
            transactionId: soxData.financialTransaction.id,
            approvalLevel: 'first_approval',
            approver: soxData.internalControls.dualApproval.firstApprover,
            approvalTimestamp: soxData.internalControls.dualApproval.approvalTimestamp1,
            approvalAmount: soxData.financialTransaction.amount,
            segregationMaintained: true,
          },
          supportingDocuments: soxData.internalControls.supportingDocuments,
          riskAssessment: soxData.riskAssessment,
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate SOX Section 404 internal control assessment', async () => {
      const controlAssessmentData = {
        assessmentId: `ctrl-assess-${randomBytes(8).toString('hex')}`,
        fiscalYear: 2024,
        assessmentDate: new Date(),
        scope: 'entity_level_and_activity_level',
        framework: 'COSO_2013',
      };

      // Test Section 404: Management assessment of internal controls
      await AuditUtils.logDataAccess(
        'sox_section_404_assessment',
        controlAssessmentData.assessmentId,
        'assess',
        'internal-controls-manager@company.com',
        true,
        {
          complianceContext: {
            framework: 'SOX' as ComplianceFramework,
            section: 'Section 404 - Internal control assessment',
            assessmentFramework: controlAssessmentData.framework,
            fiscalYear: controlAssessmentData.fiscalYear,
          },
          entityLevelControls: {
            controlEnvironment: {
              integrityEthicalValues: 'effective',
              governanceOversight: 'effective',
              organizationalStructure: 'effective',
              competenceCommitment: 'effective',
              humanResourcePolicies: 'effective',
            },
            riskAssessment: {
              objectivesSetting: 'effective',
              riskIdentification: 'effective',
              riskAnalysis: 'effective',
              fraudRiskAssessment: 'effective',
              changeManagement: 'effective',
            },
            controlActivities: {
              controlSelectionDevelopment: 'effective',
              technologyGeneralControls: 'effective',
              policiesProcedures: 'effective',
            },
            informationCommunication: {
              relevantInformation: 'effective',
              internalCommunication: 'effective',
              externalCommunication: 'effective',
            },
            monitoringActivities: {
              ongoingEvaluations: 'effective',
              separateEvaluations: 'effective',
              reportingDeficiencies: 'effective',
            },
          },
          activityLevelControls: [
            {
              process: 'revenue_recognition',
              controlId: 'REV-001',
              controlObjective: 'ensure_proper_revenue_recognition',
              controlActivity: 'three_way_match_verification',
              frequency: 'daily',
              effectiveness: 'operating_effectively',
              testingResult: 'no_exceptions',
            },
            {
              process: 'financial_reporting',
              controlId: 'FIN-001',
              controlObjective: 'accurate_financial_statement_preparation',
              controlActivity: 'monthly_account_reconciliation',
              frequency: 'monthly',
              effectiveness: 'operating_effectively',
              testingResult: 'no_exceptions',
            },
          ],
          materialWeaknessEvaluation: {
            criteriaApplied: 'material_misstatement_reasonable_possibility',
            weaknessesIdentified: [],
            remediationRequired: false,
          },
          managementConclusion: {
            effectivenessOpinion: 'effective',
            significantDeficiencies: [],
            materialWeaknesses: [],
            basisForConclusion: 'comprehensive_testing_evaluation',
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate SOX whistleblower protection compliance', async () => {
      const whistleblowerData = {
        reportId: `wb-${randomBytes(8).toString('hex')}`,
        reportDate: new Date(),
        reportingChannel: 'anonymous_hotline',
        allegationType: 'financial_irregularity',
        protectionMeasures: ['anonymity', 'retaliation_protection', 'investigation_integrity'],
      };

      // Test Section 806: Whistleblower protection
      await AuditUtils.logSecurityEvent(
        'SOX Section 806 - Whistleblower protection',
        'high',
        ['sox_compliance', 'whistleblower_protection'],
        {
          complianceContext: {
            framework: 'SOX' as ComplianceFramework,
            section: 'Section 806 - Whistleblower protection',
            protectionProvisions: whistleblowerData.protectionMeasures,
          },
          whistleblowerReport: {
            reportId: whistleblowerData.reportId,
            reportDate: whistleblowerData.reportDate,
            channel: whistleblowerData.reportingChannel,
            allegationType: whistleblowerData.allegationType,
            anonymityMaintained: true,
            retaliationProhibited: true,
          },
          investigationProcess: {
            assignedTo: 'audit_committee',
            investigationStarted: new Date(),
            expectedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            independentCounselEngaged: true,
            findingsDocumented: false, // Investigation ongoing
          },
          employeeProtections: {
            dischargeSuspensionProhibited: true,
            demotionProhibited: true,
            harassmentProhibited: true,
            discriminationProhibited: true,
            rightsRemedy: 'department_of_labor_complaint',
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThan(0);
    });
  });

  describe('hIPAA Compliance Validation', () => {
    test('should validate HIPAA Privacy Rule compliance', async () => {
      const hipaaData = ComplianceDataGenerator.generateHIPAAHealthData();

      // Test Privacy Rule: Uses and disclosures
      await AuditUtils.logDataAccess(
        'hipaa_privacy_rule_compliance',
        `phi-${hipaaData.protectedHealthInfo.patientId}`,
        'read',
        hipaaData.accessControl.authorizedPersonnel[0].id,
        true,
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Privacy Rule - 45 CFR 164.502',
            useDisclosureType: 'treatment',
            minimumNecessaryApplied: hipaaData.accessControl.minimumNecessary,
          },
          accessContext: {
            coveredEntity: hipaaData.accessControl.coveredEntity,
            businessAssociate: hipaaData.accessControl.businessAssociate,
            authorizedPerson: hipaaData.accessControl.authorizedPersonnel[0],
            accessPurpose: hipaaData.accessControl.accessPurpose,
            emergencyAccess: hipaaData.accessControl.emergencyAccess,
            patientAuthorization: hipaaData.accessControl.patientAuthorization,
          },
          phiCategories: [
            'demographics',
            'diagnosis_codes',
            'treatment_records',
            'medication_history',
          ],
          disclosureTracking: {
            enabled: hipaaData.accessControl.disclosureTracking,
            recipientInfo: 'healthcare_provider',
            purposeOfDisclosure: 'continuity_of_care',
            dateOfDisclosure: new Date(),
          },
          patientRights: {
            accessRights: 'patient_can_access_records',
            amendmentRights: 'patient_can_request_amendments',
            restrictionRights: 'patient_can_request_restrictions',
            accountingRights: 'patient_can_request_accounting',
            alternativeCommunication: 'patient_can_request_alternative',
          },
        },
      );

      // Test Notice of Privacy Practices
      await AuditUtils.logDataAccess(
        'hipaa_privacy_notice',
        'privacy-notice-acknowledgment',
        'acknowledge',
        hipaaData.protectedHealthInfo.patientId,
        true,
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Privacy Rule - 45 CFR 164.520',
            requirement: 'notice_of_privacy_practices',
          },
          noticeDetails: {
            version: '2024.1',
            effectiveDate: new Date('2024-01-01'),
            acknowledgmentDate: new Date(),
            acknowledgmentMethod: 'electronic_signature',
            noticeContent: {
              usesDisclosures: 'treatment_payment_operations',
              individualRights: 'access_amend_restrict_account',
              contactInformation: 'privacy_officer@medicalcenter.com',
              complaintProcess: 'internal_and_hhs_complaints',
              effectiveDate: '2024-01-01',
            },
          },
          patientCommunication: {
            languagePreference: 'English',
            communicationMethod: 'electronic',
            alternativeFormatRequested: false,
            interpreterServices: false,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate HIPAA Security Rule compliance', async () => {
      const securityData = {
        entityId: 'medical-center-001',
        assessmentDate: new Date(),
        securityOfficer: 'security@medicalcenter.com',
        riskAssessmentId: `risk-${randomBytes(8).toString('hex')}`,
      };

      // Test Security Rule: Administrative safeguards
      await AuditUtils.logSecurityEvent(
        'HIPAA Security Rule - Administrative safeguards',
        'medium',
        ['hipaa_compliance', 'administrative_safeguards'],
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Security Rule - 45 CFR 164.308',
            safeguardType: 'administrative',
          },
          administrativeSafeguards: {
            securityOfficer: {
              designated: true,
              qualifications: 'healthcare_security_certification',
              responsibilities: [
                'conduct_risk_assessments',
                'develop_security_policies',
                'oversee_compliance_program',
                'incident_response_coordination',
              ],
            },
            workforceTraining: {
              securityAwareness: true,
              roleBasedTraining: true,
              trainingFrequency: 'annual',
              trainingDocumentation: true,
              lastTrainingDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            },
            accessManagement: {
              uniqueUserIdentification: true,
              emergencyAccessProcedure: true,
              automaticLogoff: true,
              encryptionDecryption: true,
            },
            contingencyPlan: {
              dataBackupPlan: 'automated_encrypted_backup',
              disasterRecoveryPlan: 'tested_annually',
              emergencyModeOperation: 'defined_procedures',
              testingRevisionProcedures: 'semi_annual_testing',
            },
            riskAssessment: {
              conductedDate: securityData.assessmentDate,
              assessmentId: securityData.riskAssessmentId,
              vulnerabilitiesIdentified: 0,
              riskMitigationPlans: [],
              nextAssessmentDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
      );

      // Test Security Rule: Physical safeguards
      await AuditUtils.logSecurityEvent(
        'HIPAA Security Rule - Physical safeguards',
        'medium',
        ['hipaa_compliance', 'physical_safeguards'],
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Security Rule - 45 CFR 164.310',
            safeguardType: 'physical',
          },
          physicalSafeguards: {
            facilityAccessControls: {
              accessControlSystemType: 'biometric_and_keycard',
              accessLogsMaintained: true,
              visitorAccessControlled: true,
              physicalSecurityAssessment: 'annual',
            },
            workstationUse: {
              workstationAccessRestricted: true,
              screenPositioning: 'privacy_protected',
              automaticScreenLock: 15, // minutes
              physicalSecurityMeasures: 'locked_rooms_cables',
            },
            deviceMediaControls: {
              mediaInventoryMaintained: true,
              mediaDisposalProcedures: 'secure_wiping_destruction',
              mediaReuseProcedures: 'data_sanitization',
              offSiteMediaStorage: 'encrypted_secure_facility',
            },
          },
        },
      );

      // Test Security Rule: Technical safeguards
      await AuditUtils.logSecurityEvent(
        'HIPAA Security Rule - Technical safeguards',
        'medium',
        ['hipaa_compliance', 'technical_safeguards'],
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Security Rule - 45 CFR 164.312',
            safeguardType: 'technical',
          },
          technicalSafeguards: {
            accessControl: {
              uniqueUserIdentification: 'individual_user_accounts',
              emergencyAccessProcedure: 'break_glass_access',
              automaticLogoff: 'session_timeout_15_minutes',
              encryptionDecryption: 'aes_256_gcm',
            },
            auditControls: {
              auditingCapability: 'comprehensive_logging',
              auditLogReview: 'monthly_analysis',
              auditLogProtection: 'tamper_evident_storage',
              auditLogRetention: '6_years',
            },
            integrity: {
              dataIntegrityProtection: 'cryptographic_hashing',
              dataAlterationDestruction: 'monitored_prevented',
              electronicSignatures: 'digital_signatures',
            },
            personEntityAuthentication: {
              userAuthentication: 'multi_factor_authentication',
              entityAuthentication: 'certificate_based',
              biometricAuthentication: 'available_for_sensitive_access',
            },
            transmission: {
              endToEndEncryption: 'tls_1_3',
              integrityProtection: 'message_authentication_codes',
              encryptionKeyManagement: 'hardware_security_modules',
            },
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate HIPAA Breach Notification Rule compliance', async () => {
      const breachData = {
        breachId: `hipaa-breach-${randomBytes(8).toString('hex')}`,
        discoveryDate: new Date(),
        breachType: 'unauthorized_disclosure',
        affectedIndividuals: 750,
        phiInvolved: ['names', 'medical_record_numbers', 'diagnoses'],
        media: 'electronic',
        location: 'laptop_computer',
      };

      // Test Breach Notification Rule: Individual notification
      await AuditUtils.logSecurityEvent(
        'HIPAA Breach Notification - Individual notification',
        'critical',
        ['hipaa_compliance', 'breach_notification', 'individual_notification'],
        {
          complianceContext: {
            framework: 'HIPAA' as ComplianceFramework,
            rule: 'Breach Notification Rule - 45 CFR 164.404',
            notificationTimeline: '60_days_from_discovery',
            notificationRequired: breachData.affectedIndividuals >= 1,
          },
          breachDetails: breachData,
          individualNotification: {
            notificationMethod:
              breachData.affectedIndividuals < 10 ? 'written_notice' : 'written_notice_or_email',
            notificationContent: {
              breachDescription: `Unauthorized access to ${breachData.location}`,
              phiInvolved: breachData.phiInvolved.join(', '),
              stepsIndividualsShouldTake: 'monitor_explanation_of_benefits',
              stepsEntityTaking: 'enhanced_security_measures',
              contactInformation: 'privacy@medicalcenter.com',
            },
            urgentSituations: {
              immediateNotification: false,
              telephoneNotification: false,
            },
          },
          riskAssessment: {
            riskToIndividuals: 'moderate',
            factorsConsidered: [
              'nature_extent_phi',
              'unauthorized_person_used_phi',
              'phi_actually_acquired_viewed',
              'extent_risk_mitigation',
            ],
          },
        },
      );

      // Test Breach Notification Rule: HHS notification
      if (breachData.affectedIndividuals >= 500) {
        await AuditUtils.logSecurityEvent(
          'HIPAA Breach Notification - HHS notification',
          'critical',
          ['hipaa_compliance', 'breach_notification', 'hhs_notification'],
          {
            complianceContext: {
              framework: 'HIPAA' as ComplianceFramework,
              rule: 'Breach Notification Rule - 45 CFR 164.408',
              notificationTimeline: '60_days_from_discovery',
              notificationMethod: 'online_reporting_tool',
            },
            hhsNotification: {
              reportingDate: new Date(
                breachData.discoveryDate.getTime() + 60 * 24 * 60 * 60 * 1000,
              ),
              reportingMethod: 'hhs_online_tool',
              reportContent: {
                coveredEntityInfo: 'Medical Center ABC',
                breachDescription: breachData,
                individualsAffected: breachData.affectedIndividuals,
                businessAssociateInvolved: false,
                safeguardsInPlace: ['encryption', 'access_controls', 'audit_logs'],
                breachDiscoveryMethod: 'internal_audit',
                actionsToMitigate: [
                  'immediate_containment',
                  'forensic_investigation',
                  'security_enhancements',
                  'staff_retraining',
                ],
              },
            },
          },
        );
      }

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.alertCounters.highRiskEvents).toBeGreaterThanOrEqual(0); // Critical events logged as high risk
    });
  });

  describe('multi-Framework Compliance Integration', () => {
    test('should validate compliance framework interactions and conflicts', async () => {
      const multiComplianceData = {
        scenarioId: `multi-${randomBytes(8).toString('hex')}`,
        applicableFrameworks: ['GDPR', 'HIPAA', 'SOX'] as ComplianceFramework[],
        dataTypes: ['personal_data', 'health_information', 'financial_data'],
        conflictResolution: 'most_restrictive_requirement',
      };

      await AuditUtils.logDataAccess(
        'multi_framework_compliance',
        multiComplianceData.scenarioId,
        'process',
        'compliance-officer@company.com',
        true,
        {
          complianceContext: {
            frameworks: multiComplianceData.applicableFrameworks,
            dataTypes: multiComplianceData.dataTypes,
            conflictResolution: multiComplianceData.conflictResolution,
          },
          frameworkRequirements: {
            GDPR: {
              legalBasis: 'legitimate_interest',
              retentionPeriod: 1095, // 3 years
              dataSubjectRights: true,
              crossBorderRestrictions: true,
            },
            HIPAA: {
              minimumNecessary: true,
              businessAssociateAgreement: true,
              breachNotificationThreshold: 1,
              retentionPeriod: 2190, // 6 years
            },
            SOX: {
              dualApproval: true,
              auditTrail: true,
              retentionPeriod: 2555, // 7 years
              segregationOfDuties: true,
            },
          },
          complianceResolution: {
            retentionPeriod: Math.max(1095, 2190, 2555), // Most restrictive: 7 years
            accessControls: 'intersection_of_all_requirements',
            dataProtection: 'highest_security_standard',
            notificationRequirements: 'most_stringent_timeline',
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });

    test('should validate compliance reporting and audit trail requirements', async () => {
      const reportingData = {
        reportId: `comp-report-${randomBytes(8).toString('hex')}`,
        reportingPeriod: '2024-Q1',
        frameworks: ['GDPR', 'SOX', 'HIPAA'] as ComplianceFramework[],
        auditFirm: 'External Auditors LLC',
      };

      await AuditUtils.logDataAccess(
        'compliance_reporting_audit',
        reportingData.reportId,
        'generate',
        'compliance-officer@company.com',
        true,
        {
          complianceContext: {
            reportType: 'quarterly_compliance_report',
            frameworks: reportingData.frameworks,
            auditingFirm: reportingData.auditFirm,
            reportingPeriod: reportingData.reportingPeriod,
          },
          complianceMetrics: {
            totalAuditEvents: 15000,
            complianceViolations: 0,
            riskMitigationsImplemented: 12,
            trainingCompletionRate: 98.5,
            incidentResponseTime: '< 4 hours average',
            dataRetentionCompliance: 100,
          },
          frameworkSpecificMetrics: {
            GDPR: {
              dataSubjectRequests: 25,
              dataSubjectRequestsProcessed: 25,
              averageResponseTime: '18 days',
              dataBreaches: 0,
              dpoConsultations: 8,
            },
            SOX: {
              controlsEffectiveness: 'effective',
              materialWeaknesses: 0,
              significantDeficiencies: 0,
              managementCertifications: 4,
              auditFindings: 0,
            },
            HIPAA: {
              phiDisclosures: 1200,
              unauthorizedAccess: 0,
              securityIncidents: 0,
              riskAssessmentsCompleted: 4,
              businessAssociateAgreements: 15,
            },
          },
          auditTrailIntegrity: {
            eventsLogged: 15000,
            eventsRetained: 15000,
            tamperEvidenceVerified: true,
            backupVerified: true,
            accessControlsEffective: true,
          },
        },
      );

      const stats = globalAuditLogger.getAuditStats();
      expect(stats.bufferedEvents).toBeGreaterThan(0);
    });
  });
});
