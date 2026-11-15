# BorrowBox 🎁

**Your Neighbourhood, Your Shared Store.**

BorrowBox is a peer-to-peer neighbourhood item-sharing platform that enables residents
within an apartment community to list items they are willing to lend and borrow items from
their neighbours.

---

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Demo Accounts

All demo accounts use the password: **`demo1234`**

| Name          | Email              | Role             | Building    | Apt |
|---------------|--------------------|------------------|-------------|-----|
| Arjun Sharma  | arjun@demo.com     | Top Lender       | Maple Block | 3B  |
| Priya Nair    | priya@demo.com     | Active Borrower  | Oak Block   | 5A  |
| Rahul Verma   | rahul@demo.com     | Borrower         | Pine Block  | 1C  |
| Sneha Reddy   | sneha@demo.com     | Power Lender     | Maple Block | 7D  |
| Karthik Iyer  | karthik@demo.com   | Outdoors         | Oak Block   | 2F  |

> Tip: Use the one-click demo account buttons on the Sign In page.

---

## 🚀 Complete Borrowing Lifecycle Demo

Follow this end-to-end flow to demonstrate the full MVP:

### 1. List an Item (as Arjun — lender)
1. Sign in as **arjun@demo.com**
2. Click **List Item** in the navbar
3. Fill in a title, description, select a category and image
4. Choose lending type (Free / Paid / Credits) and set pricing
5. Click **Publish Listing**

### 2. Discover an Item (as Priya — borrower)
1. Sign out and sign in as **priya@demo.com**
2. Click **Browse** in the navbar
3. Use search, category filters and lending-type filters to find an item
4. Click any item card to view details

### 3. Request to Borrow
1. On the Item Detail page, select a **start** and **end** date
2. Optionally add a message to the lender
3. Click **Request to Borrow**
4. The request appears in **My Borrowings** with status **Pending**

### 4. Approve the Request (back as Arjun — lender)
1. Sign out and sign in as **arjun@demo.com**
2. Click **Requests** in the navbar
3. Find the pending request and click **Approve**
4. Transactions are automatically recorded (rental fee, deposit, credits)

### 5. Mark as Collected (Arjun confirms handover)
1. On the same Requests page, click **Mark as Collected**
2. The status changes to **Active** and the item becomes unavailable in Browse

### 6. Return the Item (as Priya — borrower)
1. Sign back in as **priya@demo.com**
2. Click **My Borrowings**
3. Find the active borrowing and click **Return Item**
4. The item becomes available again
5. The lender earns community credits

### 7. Leave a Rating
1. After returning, a rating prompt appears inline
2. Select a star score and write a review
3. The lender's rating is updated on their profile

### 8. View Transaction History
1. Click **Transactions** in the navbar
2. See all rental fees, deposits, refunds, and credits recorded for your account

---

## 📱 Application Screens

| Screen                  | Route                  | Description                                  |
|-------------------------|------------------------|----------------------------------------------|
| Landing Page            | `/`                    | Marketing hero + features + community stats  |
| Sign In                 | `/login`               | Email/password login with demo account buttons |
| Register                | `/register`            | Create a new account                         |
| Browse Items            | `/browse`              | Grid/list with search, category, type filters |
| Item Detail             | `/items/:id`           | Full item info, lender profile, request form |
| Add Listing             | `/add-listing`         | Create a new item listing                    |
| Edit Listing            | `/edit-listing/:id`    | Edit or delete an existing listing           |
| My Listings             | `/my-listings`         | Manage your listed items                     |
| Borrowing Requests      | `/requests`            | Lender view — approve/reject/collect         |
| My Borrowings           | `/my-borrowings`       | Borrower view — track & return items         |
| Transaction History     | `/transactions`        | All payments and credits                     |
| Community Impact        | `/community`           | Stats, leaderboard, member directory         |
| Profile                 | `/profile`             | Edit profile, view stats, sign out           |

---

## 🏗️ Technical Notes

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Data**: localStorage persistence (prototype) — data survives page reloads
- **Seeded data**: 5 demo users, 10 items, 5 completed transactions — loaded once on first visit

> ⚠️ **Prototype disclosure**: All payments and credit transactions are simulated.
> No real money, no real financial service. Data is local to your browser.

---

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

---

## 📋 Business Rules Implemented

- ✅ Unavailable items cannot be requested
- ✅ No overlapping approved bookings for the same item
- ✅ Lenders cannot approve their own borrowing requests (UI prevents submission)  
- ✅ Date validation (no past dates, end ≥ start)
- ✅ Credit balance check before credit-based requests
- ✅ Security deposits tracked separately from rental fees
- ✅ Items restored to available after successful return
- ✅ Credit transactions recorded once per completed lend
- ✅ Transaction history scoped per user

---

Built for Greenfield Apartments Community, Bengaluru 🇮🇳
