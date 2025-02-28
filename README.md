# LoopTrack: Tokenized Fitness Rewards

A fitness tracking system that rewards users with tokens for completing workouts and achieving fitness goals.

## Features
- Track fitness activities and workouts
- Earn tokens for completing activities
- Redeem tokens for rewards
- View activity history and token balance
- Set and track fitness goals

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts 
4. Run `clarinet test` to run test suite

## Usage Examples
```clarity
;; Log a workout activity
(contract-call? .loop-track log-activity 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM "running" u30 u5000)

;; Check token balance
(contract-call? .loop-track get-token-balance 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Redeem tokens for reward
(contract-call? .loop-track redeem-tokens u100 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
