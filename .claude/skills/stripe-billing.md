# Skill: Stripe Billing Integration

## When to Use
When implementing subscription plans, usage tracking, or payment flows.

## Prompt Template
```
Implement Stripe billing for NexusAI:

Plans:
- Free:       0 credits/month, limited models
- Pro:        $19/month, 1000 credits, all models
- Enterprise: custom pricing, unlimited, priority routing

Implementation:
- BillingService: createCustomer, createSubscription, cancelSubscription
- WebhookController: handle Stripe events (invoice.paid, customer.subscription.deleted)
- UsageService: track API calls per user, decrement credits
- Guard: UsageLimitGuard — block request if credits exhausted

Requirements:
- Store Stripe customerId + subscriptionId on User model
- Use Stripe webhook signature verification
- Emit billing events to analytics service
- Return upgrade prompt to frontend when limit hit (402 status)
```

## Example Usage
```bash
claude "Implement Stripe subscription billing with Free/Pro/Enterprise plans, usage credit tracking, and webhook handler for NexusAI"
```
