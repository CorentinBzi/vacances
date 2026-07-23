import type { Role, UserName } from "@/config/appConfig";

export interface UserRecord {
  name: UserName;
  role: Role;
  /** SHA-256 of the user's personal password, once set. Null until then. */
  passwordHash: string | null;
  /** Guests must change their password on first login; admin never does. */
  hasCustomPassword: boolean;
}

export interface Trip {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
}

export interface Availability {
  userName: string;
  /** ISO dates (YYYY-MM-DD) the user is NOT available. */
  unavailableDates: string[];
  submitted: boolean;
  updatedAt: number;
}

export type ItemType =
  | "transport"
  | "lodging"
  | "activity"
  | "place"
  | "food"
  | "other";

export interface ProposalItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  /** Human-readable place / address. */
  location?: string;
  lat?: number;
  lon?: number;
  /** ISO datetime, used to order the timeline. */
  startDateTime?: string;
  endDateTime?: string;
  /** Outbound link so users can actually book (flight/hotel/etc.). */
  bookingUrl?: string;
  cost?: number;
}

export interface Destination {
  name: string;
  displayName: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface Proposal {
  id: string;
  title: string;
  createdBy: string;
  createdAt: number;
  destination: Destination;
  startDate?: string;
  endDate?: string;
  items: ProposalItem[];
  /** Map of userName -> true for everyone who voted. */
  votes: Record<string, boolean>;
  comments: Comment[];
}

export type Unsubscribe = () => void;

/** Unified data access contract implemented by both backends. */
export interface Database {
  readonly backend: "firestore" | "local";

  // Users
  getUser(name: UserName): Promise<UserRecord | null>;
  ensureUser(name: UserName, role: Role): Promise<UserRecord>;
  setUserPassword(name: UserName, passwordHash: string): Promise<void>;

  // Trips
  subscribeTrips(cb: (trips: Trip[]) => void): Unsubscribe;
  createTrip(name: string, createdBy: string): Promise<Trip>;

  // Availability
  subscribeAvailability(
    tripId: string,
    cb: (rows: Availability[]) => void
  ): Unsubscribe;
  getAvailability(tripId: string, userName: string): Promise<Availability | null>;
  setAvailability(
    tripId: string,
    userName: string,
    unavailableDates: string[]
  ): Promise<void>;

  // Proposals
  subscribeProposals(
    tripId: string,
    cb: (proposals: Proposal[]) => void
  ): Unsubscribe;
  createProposal(
    tripId: string,
    proposal: Omit<Proposal, "id" | "createdAt" | "votes" | "comments">
  ): Promise<Proposal>;
  toggleVote(tripId: string, proposalId: string, userName: string): Promise<void>;
  addComment(
    tripId: string,
    proposalId: string,
    author: string,
    text: string
  ): Promise<void>;
}
