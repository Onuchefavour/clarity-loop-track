;; LoopTrack Contract
(define-fungible-token loop-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-activity (err u101))
(define-constant err-insufficient-tokens (err u102))
(define-constant err-unauthorized (err u103))
(define-constant err-invalid-params (err u104))

;; Data vars
(define-data-var token-name (string-ascii 32) "Loop Token")
(define-data-var token-symbol (string-ascii 10) "LOOP")
(define-data-var rewards-rate uint u10) ;; tokens per minute of activity

;; Valid activity types
(define-data-var valid-activities (list 10 (string-ascii 20)) 
  (list "running" "walking" "cycling" "swimming" "gym"))

;; Activity tracking map
(define-map user-activities 
  principal 
  {
    total-activities: uint,
    total-minutes: uint,
    total-calories: uint
  }
)

;; Helper functions
(define-private (is-valid-activity (activity-type (string-ascii 20)))
  (unwrap-panic (index-of (var-get valid-activities) activity-type))
)

(define-private (validate-activity-params (duration uint) (calories uint))
  (and (< duration u480) ;; max 8 hours
       (< calories u10000)) ;; reasonable calorie limit
)

;; Public functions
(define-public (log-activity (user principal) (activity-type (string-ascii 20)) (duration uint) (calories uint))
  (let (
    (current-stats (default-to 
      {total-activities: u0, total-minutes: u0, total-calories: u0}
      (map-get? user-activities user)))
    (tokens-earned (* duration (var-get rewards-rate)))
  )
    (asserts! (is-eq tx-sender user) err-unauthorized)
    (asserts! (is-valid-activity activity-type) err-invalid-activity)
    (asserts! (validate-activity-params duration calories) err-invalid-params)
    
    (try! (ft-mint? loop-token tokens-earned user))
    (print {event: "activity-logged", user: user, activity: activity-type, duration: duration})
    
    (ok (map-set user-activities 
      user
      {
        total-activities: (+ (get total-activities current-stats) u1),
        total-minutes: (+ (get total-minutes current-stats) duration),
        total-calories: (+ (get total-calories current-stats) calories)
      }
    ))
  )
)

(define-public (redeem-tokens (amount uint) (user principal))
  (let ((balance (ft-get-balance loop-token user)))
    (asserts! (is-eq tx-sender user) err-unauthorized)
    (asserts! (>= balance amount) err-insufficient-tokens)
    
    (try! (ft-burn? loop-token amount user))
    (print {event: "tokens-redeemed", user: user, amount: amount})
    (ok true)
  )
)

(define-public (update-rewards-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set rewards-rate new-rate)
    (print {event: "rewards-rate-updated", new-rate: new-rate})
    (ok true)
  )
)

;; Read only functions
(define-read-only (get-token-balance (account principal))
  (ok (ft-get-balance loop-token account))
)

(define-read-only (get-activity-stats (user principal))
  (ok (default-to 
    {total-activities: u0, total-minutes: u0, total-calories: u0}
    (map-get? user-activities user)))
)

(define-read-only (get-rewards-rate)
  (ok (var-get rewards-rate))
)

(define-read-only (get-valid-activities)
  (ok (var-get valid-activities))
)
