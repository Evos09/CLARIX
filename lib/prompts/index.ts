import type { PromptSpec } from "./base";
import universal from "./universal";
import standup from "./standup";
import oneOnOne from "./oneOnOne";
import allHands from "./allHands";
import projectKickoff from "./projectKickoff";
import sprintPlanning from "./sprintPlanning";
import retrospective from "./retrospective";
import productReview from "./productReview";
import clientMeeting from "./clientMeeting";
import salesCall from "./salesCall";
import discoveryCall from "./discoveryCall";
import interview from "./interview";
import boardMeeting from "./boardMeeting";
import investorUpdate from "./investorUpdate";
import brainstorm from "./brainstorm";
import trainingWorkshop from "./trainingWorkshop";
import vendorCall from "./vendorCall";
import performanceReview from "./performanceReview";
import strategySession from "./strategySession";
import healthcare from "./healthcare";
import legal from "./legal";
import financial from "./financial";

export const PROMPTS: Record<string, PromptSpec> = {
  GENERAL: universal,
  STANDUP: standup,
  ONE_ON_ONE: oneOnOne,
  ALL_HANDS: allHands,
  PROJECT_KICKOFF: projectKickoff,
  SPRINT_PLANNING: sprintPlanning,
  RETROSPECTIVE: retrospective,
  PRODUCT_REVIEW: productReview,
  CLIENT_MEETING: clientMeeting,
  SALES_CALL: salesCall,
  DISCOVERY_CALL: discoveryCall,
  INTERVIEW: interview,
  BOARD_MEETING: boardMeeting,
  INVESTOR_UPDATE: investorUpdate,
  BRAINSTORM: brainstorm,
  TRAINING_WORKSHOP: trainingWorkshop,
  VENDOR_CALL: vendorCall,
  PERFORMANCE_REVIEW: performanceReview,
  STRATEGY_SESSION: strategySession,
  MEDICAL_APPOINTMENT: healthcare,
  LEGAL_DEPOSITION: legal,
  FINANCIAL_ADVISORY: financial,
};

export function getPromptSpec(typeId: string): PromptSpec {
  return PROMPTS[typeId] ?? universal;
}

export type { PromptSpec } from "./base";
