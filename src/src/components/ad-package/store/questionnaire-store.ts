import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debounce } from 'lodash';
import { apiRequest } from '@/lib/queryClient';

// Updated design complexity mode with expanded options
export type DesignComplexityMode = 'simple' | 'advanced' | 'professional';

// Types for questionnaire sections
export interface BusinessInfo {
  businessName: string;
  legalStructure: string;
  yearsInBusiness: number;
  industry: string;
  businessDescription: string;
  primaryServices: string;
  targetAudience: string;
  marketingBudget: string;
  businessGoals: string[];
  websiteGoals: string[];
}

export interface BusinessOperations {
  employeeCount: number;
  locations: string[];
  operatingHours: string;
  serviceAreas: string[];
  certifications: string[];
  partnerships: string[];
  equipmentUsed: string[];
  processMethods: string[];
}

export interface LegalInfo {
  businessLicenseNumber?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  insuranceInfo?: string;
  termsAndConditions: string;
  privacyPolicy: string;
  disclaimers?: string;
  returnPolicy?: string;
}

export interface AdditionalServices {
  offeredServices: string[];
  specialPromotions: string[];
  packages: {
    name: string;
    description: string;
    price: string;
    inclusions: string[];
  }[];
  guarantees: string[];
  testimonials: {
    name: string;
    company?: string;
    testimonial: string;
    rating?: number;
  }[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  socialMedia: {
    platform: string;
    url: string;
  }[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson?: {
    name: string;
    position: string;
    phone?: string;
    email?: string;
  };
  preferredContactMethod: string[];
}

export interface BrandCampaign {
  brandName: string;
  logoUrl?: string;
  tagline?: string;
  brandColors: string[];
  brandVoice: string;
  targetKeywords: string[];
  campaignGoals: string[];
  callToAction: string;
  brandValues: string[];
  competitorAnalysis?: string[];
}

// New advanced sections (added in p823)
export interface RecentProjects {
  projects: {
    title: string;
    description: string;
    imageUrl?: string;
    completionDate?: string;
    clientName?: string;
    testimonial?: string;
    results?: string;
    category?: string;
  }[];
}

export interface AboutTimeline {
  milestones: {
    year: number;
    title: string;
    description: string;
    imageUrl?: string;
    achievement?: string;
  }[];
  mission?: string;
  vision?: string;
  foundingStory?: string;
  teamMembers?: {
    name: string;
    position: string;
    bio?: string;
    imageUrl?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  }[];
}

export interface ClientSuccessStories {
  stories: {
    clientName: string;
    industry?: string;
    challenge: string;
    solution: string;
    results: string;
    testimonial?: string;
    imageUrl?: string;
    metrics?: {
      label: string;
      value: string;
      icon?: string;
    }[];
  }[];
}

export interface FAQs {
  questions: {
    question: string;
    answer: string;
    category?: string;
  }[];
  contactInfo?: {
    message: string;
    email?: string;
    phone?: string;
  };
}

// Define the in-progress save type for partial saves
export interface PartialSaveResult {
  success: boolean;
  savedLocally?: boolean;
  isMinimalSave?: boolean;
  criticalFailure?: boolean;
  attemptsTaken?: number;
  message?: string;
}

// Define the API functions
const saveQuestionnaireAPI = async (data: any) => {
  try {
    const response = await apiRequest('POST', '/api/questionnaires', data);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    throw error;
  }
};

const updateQuestionnaireAPI = async (id: number, data: any) => {
  try {
    const response = await apiRequest('PUT', `/api/questionnaires/${id}`, data);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error updating questionnaire:', error);
    throw error;
  }
};

const getQuestionnaireAPI = async (id: number) => {
  try {
    const response = await apiRequest('GET', `/api/questionnaires/${id}`);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error getting questionnaire:', error);
    throw error;
  }
};

const generateLandingPageAPI = async (
  questionnaireId: number, 
  selectedTemplate: string, 
  designComplexity: DesignComplexityMode
) => {
  try {
    const response = await apiRequest('POST', '/api/landing-pages', {
      questionnaireId,
      template: selectedTemplate,
      designComplexity
    });
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error generating landing page:', error);
    throw error;
  }
};

// Define the store interface
interface QuestionnaireState {
  step: number;
  businessInfo: Partial<BusinessInfo>;
  businessOperations: Partial<BusinessOperations>;
  legalInfo: Partial<LegalInfo>;
  additionalServices: Partial<AdditionalServices>;
  contactInfo: Partial<ContactInfo>;
  brandCampaign: Partial<BrandCampaign>;
  // New advanced sections (added in p823)
  recentProjects: Partial<RecentProjects>;
  aboutTimeline: Partial<AboutTimeline>;
  clientSuccessStories: Partial<ClientSuccessStories>;
  faqs: Partial<FAQs>;
  isComplete: boolean;
  lastSaved: string | null;
  isLoading: boolean;
  lastChangeTimestamp: number; // Track when state was last changed
  questionnaireId?: number; // ID of the saved questionnaire in the database
  landingPageId?: number; // ID of the generated landing page
  selectedTemplate: string; // ID of the selected template for landing page
  designComplexity: DesignComplexityMode; // Toggle between simple, advanced, and professional design
  setStep: (step: number) => void;
  setBusinessInfo: (info: Partial<BusinessInfo>) => void;
  setBusinessOperations: (ops: Partial<BusinessOperations>) => void;
  setLegalInfo: (legal: Partial<LegalInfo>) => void;
  setAdditionalServices: (services: Partial<AdditionalServices>) => void;
  setContactInfo: (contact: Partial<ContactInfo>) => void;
  setBrandCampaign: (campaign: Partial<BrandCampaign>) => void;
  // Setters for new advanced sections
  setRecentProjects: (projects: Partial<RecentProjects>) => void;
  setAboutTimeline: (timeline: Partial<AboutTimeline>) => void;
  setClientSuccessStories: (stories: Partial<ClientSuccessStories>) => void;
  setFAQs: (faqs: Partial<FAQs>) => void;
  setComplete: (complete: boolean) => void;
  setLastSaved: (timestamp: string) => void;
  setLoading: (loading: boolean) => void;
  setQuestionnaireId: (id: number) => void;
  setLandingPageId: (id: number) => void;
  setSelectedTemplate: (templateId: string) => void;
  setDesignComplexity: (mode: DesignComplexityMode) => void;
  toggleDesignComplexity: () => void;
  reset: () => void;
  saveProgress: () => Promise<PartialSaveResult>;
  saveProgressNow: () => Promise<PartialSaveResult>;
  loadQuestionnaire: (id: number) => Promise<void>;
  generateLandingPage: (templateId: string, designMode: DesignComplexityMode) => Promise<any>;
}

// Create a debounced save function outside the store to avoid recreating it
const createDebouncedSave = (save: () => Promise<PartialSaveResult>) => 
  debounce(save, 5000); // Debounce save calls to 5 seconds

// Create and export the store
export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set, get) => ({
      // Initial state
      step: 0,
      businessInfo: {},
      businessOperations: {},
      legalInfo: {},
      additionalServices: {},
      contactInfo: {},
      brandCampaign: {},
      // Initial state for new advanced sections
      recentProjects: { projects: [] },
      aboutTimeline: { milestones: [] },
      clientSuccessStories: { stories: [] },
      faqs: { questions: [] },
      isComplete: false,
      lastSaved: null,
      isLoading: false,
      lastChangeTimestamp: Date.now(),
      selectedTemplate: 'professional',
      designComplexity: 'simple',

      // Actions
      setStep: (step) => set({ step, lastChangeTimestamp: Date.now() }),
      
      setBusinessInfo: (info) => set((state) => ({ 
        businessInfo: { ...state.businessInfo, ...info },
        lastChangeTimestamp: Date.now()
      })),
      
      setBusinessOperations: (ops) => set((state) => ({ 
        businessOperations: { ...state.businessOperations, ...ops },
        lastChangeTimestamp: Date.now()
      })),
      
      setLegalInfo: (legal) => set((state) => ({ 
        legalInfo: { ...state.legalInfo, ...legal },
        lastChangeTimestamp: Date.now()
      })),
      
      setAdditionalServices: (services) => set((state) => ({ 
        additionalServices: { ...state.additionalServices, ...services },
        lastChangeTimestamp: Date.now()
      })),
      
      setContactInfo: (contact) => set((state) => ({ 
        contactInfo: { ...state.contactInfo, ...contact },
        lastChangeTimestamp: Date.now()
      })),
      
      setBrandCampaign: (campaign) => set((state) => ({ 
        brandCampaign: { ...state.brandCampaign, ...campaign },
        lastChangeTimestamp: Date.now()
      })),
      
      // Setters for new advanced sections
      setRecentProjects: (projects) => set((state) => ({ 
        recentProjects: { ...state.recentProjects, ...projects },
        lastChangeTimestamp: Date.now()
      })),
      
      setAboutTimeline: (timeline) => set((state) => ({ 
        aboutTimeline: { ...state.aboutTimeline, ...timeline },
        lastChangeTimestamp: Date.now()
      })),
      
      setClientSuccessStories: (stories) => set((state) => ({ 
        clientSuccessStories: { ...state.clientSuccessStories, ...stories },
        lastChangeTimestamp: Date.now()
      })),
      
      setFAQs: (faqs) => set((state) => ({ 
        faqs: { ...state.faqs, ...faqs },
        lastChangeTimestamp: Date.now()
      })),
      
      setComplete: (complete) => set({ isComplete: complete, lastChangeTimestamp: Date.now() }),
      
      setLastSaved: (timestamp) => set({ lastSaved: timestamp }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setQuestionnaireId: (id) => set({ questionnaireId: id }),
      
      setLandingPageId: (id) => set({ landingPageId: id }),
      
      setSelectedTemplate: (templateId) => set({ 
        selectedTemplate: templateId,
        lastChangeTimestamp: Date.now()
      }),
      
      setDesignComplexity: (mode) => set({ 
        designComplexity: mode,
        lastChangeTimestamp: Date.now()
      }),
      
      toggleDesignComplexity: () => set((state) => {
        // Cycle through complexity modes: simple -> advanced -> professional -> simple
        const currentMode = state.designComplexity;
        let newMode: DesignComplexityMode;
        
        switch (currentMode) {
          case 'simple':
            newMode = 'advanced';
            break;
          case 'advanced':
            newMode = 'professional';
            break;
          case 'professional':
          default:
            newMode = 'simple';
            break;
        }
        
        return {
          designComplexity: newMode,
          lastChangeTimestamp: Date.now()
        };
      }),
      
      reset: () => set({
        step: 0,
        businessInfo: {},
        businessOperations: {},
        legalInfo: {},
        additionalServices: {},
        contactInfo: {},
        brandCampaign: {},
        recentProjects: { projects: [] },
        aboutTimeline: { milestones: [] },
        clientSuccessStories: { stories: [] },
        faqs: { questions: [] },
        isComplete: false,
        lastSaved: null,
        questionnaireId: undefined,
        landingPageId: undefined,
        selectedTemplate: 'professional',
        designComplexity: 'simple',
        lastChangeTimestamp: Date.now()
      }),
      
      // Enhanced save progress with multiple retry attempts and better error handling
      saveProgress: async () => {
        // Use a singleton debounced save function
        const debouncedSave = createDebouncedSave(get().saveProgressNow);
        return debouncedSave();
      },
      
      // Immediate save (no debounce) with comprehensive retry logic and local backup
      saveProgressNow: async () => {
        const state = get();
        
        // Don't save if no changes since last save
        if (state.lastSaved && new Date(state.lastSaved).getTime() > state.lastChangeTimestamp) {
          console.log('No changes since last save, skipping');
          return { success: true, message: 'No changes to save' };
        }
        
        set({ isLoading: true });
        
        // Collect data for API
        const questionnaireData = {
          business_info: state.businessInfo,
          business_operations: state.businessOperations,
          legal_info: state.legalInfo,
          additional_services: state.additionalServices,
          contact_info: state.contactInfo,
          brand_campaign: state.brandCampaign,
          // Include new advanced sections
          recent_projects: state.recentProjects,
          about_timeline: state.aboutTimeline,
          client_success_stories: state.clientSuccessStories,
          faqs: state.faqs,
          is_complete: state.isComplete,
          selected_template: state.selectedTemplate,
          design_complexity: state.designComplexity
        };
        
        // Create backup in localStorage
        try {
          localStorage.setItem('questionnaire_backup', JSON.stringify({
            data: questionnaireData,
            timestamp: new Date().toISOString()
          }));
        } catch (backupError) {
          console.error('Error creating local backup:', backupError);
        }
        
        let attemptCount = 0;
        const maxAttempts = 3;
        
        // Try to save to server with up to 3 attempts
        while (attemptCount < maxAttempts) {
          attemptCount++;
          
          try {
            let response;
            
            // Update existing or create new questionnaire
            if (state.questionnaireId) {
              response = await updateQuestionnaireAPI(state.questionnaireId, questionnaireData);
            } else {
              response = await saveQuestionnaireAPI(questionnaireData);
              // Set the ID if this is a new questionnaire
              if (response && response.id) {
                set({ questionnaireId: response.id });
              }
            }
            
            // Update last saved timestamp
            const timestamp = new Date().toISOString();
            set({ lastSaved: timestamp, isLoading: false });
            
            console.log(`Saved questionnaire successfully (attempt ${attemptCount})`);
            
            // Return success result with metadata
            return { 
              success: true,
              attemptsTaken: attemptCount,
              message: 'Saved successfully'
            };
          } catch (error) {
            console.error(`Save attempt ${attemptCount} failed:`, error);
            
            // If this is not our last attempt, wait before retrying
            if (attemptCount < maxAttempts) {
              // Exponential backoff: 1s, 2s, 4s, etc.
              const backoffMs = Math.pow(2, attemptCount - 1) * 1000;
              console.log(`Retrying in ${backoffMs}ms...`);
              await new Promise(resolve => setTimeout(resolve, backoffMs));
            } else {
              // All attempts failed, try minimal save for critical data
              try {
                // Simplified payload with just essential data
                const minimalData = {
                  business_info: {
                    businessName: state.businessInfo.businessName || 'Untitled Business',
                    industry: state.businessInfo.industry || 'General'
                  },
                  is_complete: state.isComplete,
                  selected_template: state.selectedTemplate,
                  design_complexity: state.designComplexity
                };
                
                let minimalResponse;
                
                if (state.questionnaireId) {
                  minimalResponse = await updateQuestionnaireAPI(state.questionnaireId, minimalData);
                } else {
                  minimalResponse = await saveQuestionnaireAPI(minimalData);
                  if (minimalResponse && minimalResponse.id) {
                    set({ questionnaireId: minimalResponse.id });
                  }
                }
                
                // Partial success
                const timestamp = new Date().toISOString();
                set({ lastSaved: timestamp, isLoading: false });
                
                return { 
                  success: true, 
                  isMinimalSave: true,
                  attemptsTaken: attemptCount,
                  message: 'Saved minimal data successfully'
                };
              } catch (minimalSaveError) {
                console.error('Even minimal save failed:', minimalSaveError);
                set({ isLoading: false });
                
                return { 
                  success: false, 
                  savedLocally: true,
                  attemptsTaken: attemptCount,
                  message: 'Server save failed, data backed up locally'
                };
              }
            }
          }
        }
        
        // This should never be reached due to the while loop structure,
        // but TypeScript doesn't know that
        set({ isLoading: false });
        return { 
          success: false, 
          savedLocally: true,
          criticalFailure: true,
          message: 'Unexpected save failure'
        };
      },
      
      // Load questionnaire from server
      loadQuestionnaire: async (id: number) => {
        try {
          set({ isLoading: true });
          
          const data = await getQuestionnaireAPI(id);
          
          // Transform snake_case from API to camelCase for store
          set({
            questionnaireId: id,
            businessInfo: data.business_info || {},
            businessOperations: data.business_operations || {},
            legalInfo: data.legal_info || {},
            additionalServices: data.additional_services || {},
            contactInfo: data.contact_info || {},
            brandCampaign: data.brand_campaign || {},
            // Load advanced sections
            recentProjects: data.recent_projects || { projects: [] },
            aboutTimeline: data.about_timeline || { milestones: [] },
            clientSuccessStories: data.client_success_stories || { stories: [] },
            faqs: data.faqs || { questions: [] },
            isComplete: data.is_complete || false,
            selectedTemplate: data.selected_template || 'professional',
            designComplexity: data.design_complexity || 'simple',
            landingPageId: data.landing_page_id,
            lastSaved: new Date().toISOString(),
            isLoading: false,
            lastChangeTimestamp: Date.now() - 1000 // Set to slightly before now to allow immediate saves
          });
        } catch (error) {
          console.error('Error loading questionnaire:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Generate landing page from questionnaire
      generateLandingPage: async (templateId: string, designMode: DesignComplexityMode) => {
        const state = get();
        
        if (!state.questionnaireId) {
          throw new Error('Cannot generate landing page: Questionnaire not saved');
        }
        
        try {
          set({ isLoading: true });
          
          // Save any pending changes first
          await get().saveProgressNow();
          
          // Generate the landing page
          const result = await generateLandingPageAPI(
            state.questionnaireId,
            templateId,
            designMode
          );
          
          // Update landing page ID in state
          if (result && result.id) {
            set({ 
              landingPageId: result.id,
              isLoading: false
            });
          }
          
          return result;
        } catch (error) {
          console.error('Error generating landing page:', error);
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'questionnaire-storage',
      partialize: (state) => ({
        businessInfo: state.businessInfo,
        businessOperations: state.businessOperations,
        legalInfo: state.legalInfo,
        additionalServices: state.additionalServices,
        contactInfo: state.contactInfo,
        brandCampaign: state.brandCampaign,
        recentProjects: state.recentProjects,
        aboutTimeline: state.aboutTimeline,
        clientSuccessStories: state.clientSuccessStories,
        faqs: state.faqs,
        step: state.step,
        isComplete: state.isComplete,
        questionnaireId: state.questionnaireId,
        landingPageId: state.landingPageId,
        selectedTemplate: state.selectedTemplate,
        designComplexity: state.designComplexity
      })
    }
  )
);

// Selectors - exported for component access
const selectStep = (state: QuestionnaireState) => state.step;
const selectBusinessInfo = (state: QuestionnaireState) => state.businessInfo;
const selectBusinessOperations = (state: QuestionnaireState) => state.businessOperations;
const selectLegalInfo = (state: QuestionnaireState) => state.legalInfo;
const selectAdditionalServices = (state: QuestionnaireState) => state.additionalServices;
const selectContactInfo = (state: QuestionnaireState) => state.contactInfo;
const selectBrandCampaign = (state: QuestionnaireState) => state.brandCampaign;
// Selectors for advanced sections
const selectRecentProjects = (state: QuestionnaireState) => state.recentProjects;
const selectAboutTimeline = (state: QuestionnaireState) => state.aboutTimeline;
const selectClientSuccessStories = (state: QuestionnaireState) => state.clientSuccessStories;
const selectFAQs = (state: QuestionnaireState) => state.faqs;
const selectIsComplete = (state: QuestionnaireState) => state.isComplete;
const selectLastSaved = (state: QuestionnaireState) => state.lastSaved;
const selectIsLoading = (state: QuestionnaireState) => state.isLoading;
const selectQuestionnaireId = (state: QuestionnaireState) => state.questionnaireId;
const selectLandingPageId = (state: QuestionnaireState) => state.landingPageId;
const selectSelectedTemplate = (state: QuestionnaireState) => state.selectedTemplate;
const selectDesignComplexity = (state: QuestionnaireState) => state.designComplexity;

// Export grouped selectors for component usage
export const useQuestionnaireSelectors = () => {
  const step = useQuestionnaireStore(selectStep);
  const businessInfo = useQuestionnaireStore(selectBusinessInfo);
  const businessOperations = useQuestionnaireStore(selectBusinessOperations);
  const legalInfo = useQuestionnaireStore(selectLegalInfo);
  const additionalServices = useQuestionnaireStore(selectAdditionalServices);
  const contactInfo = useQuestionnaireStore(selectContactInfo);
  const brandCampaign = useQuestionnaireStore(selectBrandCampaign);
  // Selectors for advanced sections
  const recentProjects = useQuestionnaireStore(selectRecentProjects);
  const aboutTimeline = useQuestionnaireStore(selectAboutTimeline);
  const clientSuccessStories = useQuestionnaireStore(selectClientSuccessStories);
  const faqs = useQuestionnaireStore(selectFAQs);
  const isComplete = useQuestionnaireStore(selectIsComplete);
  const lastSaved = useQuestionnaireStore(selectLastSaved);
  const isLoading = useQuestionnaireStore(selectIsLoading);
  const questionnaireId = useQuestionnaireStore(selectQuestionnaireId);
  const landingPageId = useQuestionnaireStore(selectLandingPageId);
  const selectedTemplate = useQuestionnaireStore(selectSelectedTemplate);
  const designComplexity = useQuestionnaireStore(selectDesignComplexity);

  return {
    step,
    businessInfo,
    businessOperations,
    legalInfo,
    additionalServices,
    contactInfo,
    brandCampaign,
    recentProjects,
    aboutTimeline,
    clientSuccessStories,
    faqs,
    isComplete,
    lastSaved,
    isLoading,
    questionnaireId,
    landingPageId,
    selectedTemplate,
    designComplexity
  };
};

// Export grouped actions for component usage
export const useQuestionnaireActions = () => {
  const setStep = useQuestionnaireStore(state => state.setStep);
  const setBusinessInfo = useQuestionnaireStore(state => state.setBusinessInfo);
  const setBusinessOperations = useQuestionnaireStore(state => state.setBusinessOperations);
  const setLegalInfo = useQuestionnaireStore(state => state.setLegalInfo);
  const setAdditionalServices = useQuestionnaireStore(state => state.setAdditionalServices);
  const setContactInfo = useQuestionnaireStore(state => state.setContactInfo);
  const setBrandCampaign = useQuestionnaireStore(state => state.setBrandCampaign);
  // Actions for advanced sections
  const setRecentProjects = useQuestionnaireStore(state => state.setRecentProjects);
  const setAboutTimeline = useQuestionnaireStore(state => state.setAboutTimeline);
  const setClientSuccessStories = useQuestionnaireStore(state => state.setClientSuccessStories);
  const setFAQs = useQuestionnaireStore(state => state.setFAQs);
  const setComplete = useQuestionnaireStore(state => state.setComplete);
  const setSelectedTemplate = useQuestionnaireStore(state => state.setSelectedTemplate);
  const setDesignComplexity = useQuestionnaireStore(state => state.setDesignComplexity);
  const toggleDesignComplexity = useQuestionnaireStore(state => state.toggleDesignComplexity);
  const reset = useQuestionnaireStore(state => state.reset);
  const saveProgress = useQuestionnaireStore(state => state.saveProgress);
  const saveProgressNow = useQuestionnaireStore(state => state.saveProgressNow);
  const loadQuestionnaire = useQuestionnaireStore(state => state.loadQuestionnaire);
  const generateLandingPage = useQuestionnaireStore(state => state.generateLandingPage);

  return {
    setStep,
    setBusinessInfo,
    setBusinessOperations,
    setLegalInfo,
    setAdditionalServices,
    setContactInfo,
    setBrandCampaign,
    setRecentProjects,
    setAboutTimeline,
    setClientSuccessStories,
    setFAQs,
    setComplete,
    setSelectedTemplate,
    setDesignComplexity,
    toggleDesignComplexity,
    reset,
    saveProgress,
    saveProgressNow,
    loadQuestionnaire,
    generateLandingPage
  };
};