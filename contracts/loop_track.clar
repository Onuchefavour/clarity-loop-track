;; LoopTrack Contract
(define-fungible-token loop-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-activity (err u101))
(define-constant err-insufficient-tokens (err u102))

;; Data vars
(define-data-var token-name (string-ascii 32) "Loop Token")
(define-data-var token-symbol (string-ascii 10) "LOOP")
(define-data-var rewards-rate uint u10) ;; tokens per minute of activity

;; Activity tracking map
(define-map user-activities 
  principal 
  {
    total-activities: uint,
    total-minutes: uint,
    total-calories: uint
  }
)

;; Public functions
(define-public (log-activity (user principal) (activity-type (string-ascii 20)) (duration uint) (calories uint))
  (let (
    (current-stats (default-to 
      {total-activities: u0, total-minutes: u0, total-calories: u0}
      (map-get? user-activities user)))
    (tokens-earned (* duration (var-get rewards-rate)))
  )
    (try! (ft-mint? loop-token tokens-earned user))
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
    (if (>= balance amount)
      (begin
        (try! (ft-burn? loop-token amount user))
        (ok true)
      )
      err-insufficient-tokens
    )
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
