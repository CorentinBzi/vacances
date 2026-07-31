import type { Role, UserName } from "@/config/appConfig";

export interface UserRecord {
  name: UserName;
  role: Role;
  /** SHA-256 of the user's personal password, once set. Null until then. */
  passwordHash: string | null;
  /** Guests must change their password on first login; admin never does. */
  hasCustomPassword: boolean;
  /** Trip ids the user has unlocked with a share token. */
  unlockedTrips?: string[];
}

export interface Trip {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  /** Share token — only holders (or admin) can see the trip. */
  token?: string;
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

/** A shared expense, split equally among its participants (Tricount-style). */
export interface Expense {
  id: string;
  label: string;
  amount: number;
  /** userName who paid the full amount. */
  paidBy: string;
  /** userNames the expense is split equally among. */
  participants: string[];
  createdBy: string;
  createdAt: number;
}

export type Unsubscribe = () => void;

/** Unified data access contract implemented by both backends. */
export interface Database {
  readonly backend: "firestore" | "local";

  // Users
  getUser(name: UserName): Promise<UserRecord | null>;
  ensureUser(name: UserName, role: Role): Promise<UserRecord>;
  setUserPassword(name: UserName, passwordHash: string): Promise<void>;
  subscribeUser(
    name: UserName,
    cb: (record: UserRecord | null) => void
  ): Unsubscribe;
  unlockTrip(name: UserName, tripId: string): Promise<void>;

  // Trips
  subscribeTrips(cb: (trips: Trip[]) => void): Unsubscribe;
  createTrip(name: string, createdBy: string): Promise<Trip>;
  findTripByToken(token: string): Promise<Trip | null>;

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
  updateProposal(
    tripId: string,
    proposalId: string,
    patch: Pick<
      Proposal,
      "title" | "destination" | "startDate" | "endDate" | "items"
    >
  ): Promise<void>;
  deleteProposal(tripId: string, proposalId: string): Promise<void>;
  editComment(
    tripId: string,
    proposalId: string,
    commentId: string,
    text: string
  ): Promise<void>;
  deleteComment(
    tripId: string,
    proposalId: string,
    commentId: string
  ): Promise<void>;

  // Expenses (shared, per trip)
  subscribeExpenses(
    tripId: string,
    cb: (expenses: Expense[]) => void
  ): Unsubscribe;
  addExpense(
    tripId: string,
    expense: Omit<Expense, "id" | "createdAt">
  ): Promise<void>;
  updateExpense(
    tripId: string,
    expenseId: string,
    patch: Pick<Expense, "label" | "amount" | "paidBy" | "participants">
  ): Promise<void>;
  deleteExpense(tripId: string, expenseId: string): Promise<void>;
}
