# Logistics SaaS Project Documentation

## Overview

This repository is a logistics SaaS application built with Next.js App Router, React, PostgreSQL, and several payment and shipping integrations. It includes an admin portal, customer-facing flows, order management, shipment tracking, pricing calculators, and payment handling.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL (`pg`)
- Supabase client (`@supabase/supabase-js`)
- Cloudinary image handling (`cloudinary`, `next-cloudinary`)
- Leaflet maps (`leaflet`, `react-leaflet`)
- Zustand for local state management
- Resend email service
- Paystack and Monnify payment gateways

## Running the Project

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

- `app/`
  - `admin/` - admin portal routes and pages
  - `auth/` - authentication and user account flows
  - `base/` - customer-facing application pages
  - `api/` - backend route handlers for the REST API
  - `in_development/` - placeholder or under-construction pages
- `assets/` - static assets and app-specific data like carousel images and FAQs
- `components/` - reusable UI components organized by feature area
- `components_map_definitions/` - link and button definitions used throughout the UI
- `lib/` - shared libraries, database helpers, calculators, mail and payment utilities
- `public/` - static web assets
- `store/` - Zustand stores for client state
- `types/` - shared TypeScript data definitions and constants

## Environment Variables

This project uses environment variables for database connections, auth providers, payment gateways, upload services, and application URL settings.

Copy `.env.example` to `.env` and update the placeholder values before running locally.

Key environment variables:

- `NODE_ENV` - should be `development` locally and `production` in production.
- `BASE_URL` - backend base URL used for server-side callbacks, email links, and internal API calls.
- `NEXT_PUBLIC_APP_URL` - public application URL used for client-side redirects.
- `DATABASE_URL` - production Postgres connection string.
- `TEST_DATABASE_URL` - test Postgres connection string used in non-production mode.
- `NEXT_PUBLIC_SUPABASE_URL` - public Supabase URL for the production app.
- `NEXT_PUBLIC_SUPABASE_URL_TEST` - public Supabase URL for the test environment.
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service-role key for admin operations.
- `SUPABASE_SERVICE_ROLE_KEY_TEST` - Supabase service-role key for the test environment.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name used by image upload signatures.
- `CLOUDINARY_API_KEY` - Cloudinary API key.
- `CLOUDINARY_API_SECRET` - Cloudinary API secret.
- `PAYSTACK_SECRET_KEY` - Paystack secret key for payment initialization and verification.
- `MONNIFY_API_KEY` - Monnify API key for authentication.
- `MONNIFY_SECRET_KEY` - Monnify secret key for authentication.
- `MONNIFY_BASE_URL` - Monnify base URL, usually `https://sandbox.monnify.com` for testing.
- `MONNIFY_CONTRACT_CODE` - Monnify contract code for payment creation.
- `RESEND_API_KEY` - Resend mail provider API key.
- `SESSION_COOKIE_NAME` - optional session cookie name; defaults to `session` when unset.

## API Overview

All API routes are implemented under `app/api/` using Next.js route handlers. The base API URL is `/api`.

### Authentication

- `POST /api/auth/login` - login with email and password
- `POST /api/auth/register` - create a new user account
- `POST /api/auth/logout` - sign out and invalidate session
- `GET /api/auth/me` - fetch current authenticated user data
- `POST /api/auth/send-otp` - request a one-time password
- `POST /api/auth/verify-otp` - verify an OTP
- `GET /api/auth/verify-email-initialization` - start email verification
- `GET /api/auth/verify-email-final` - complete email verification
- `POST /api/auth/send-change-password-link` - send password reset link
- `POST /api/auth/forgot-password-change` - reset password with token
- `POST /api/auth/change-password` - change password for authenticated user
- `GET /api/auth/change-password/initialize-change` - initialize password change flow
- `POST /api/auth/change-password/forgot-password/initialize-change` - start forgotten-password reset
- `POST /api/auth/change-password/forgot-password/initialize-change/final` - complete forgotten-password reset
- `POST /api/auth/change-email` - request email change
- `GET /api/auth/change-email/initialize-change` - initialize email change flow

### Users

- `GET /api/users` - list users
- `GET /api/users/[id]` - fetch a specific user
- `GET /api/users/my-data` - fetch current user profile
- `PUT /api/users/my-data` - update current user profile
- `GET /api/users/my-data/admin` - admin access to current user data view
- `PUT /api/users/my-data/admin` - admin update of user data
- `PUT /api/users/upload-profile-picture` - upload or update a user profile image

### Addresses

- `POST /api/addresses` - create an address
- `GET /api/addresses/user` - fetch the current users addresses
- `PUT /api/addresses/user` - update a user address

### Announcements

- `GET /api/announcements` - list announcements
- `POST /api/announcements` - create an announcement
- `PUT /api/announcements` - update an announcement
- `DELETE /api/announcements` - delete an announcement
- `GET /api/announcements/[id]` - get a single announcement by ID

### Delivery Zones

- `GET /api/delivery-zones` - list delivery zones
- `PUT /api/delivery-zones` - update delivery zone data

### Packages

- `GET /api/packages` - list packages
- `POST /api/packages` - create a package record
- `GET /api/packages/user` - list packages for current user
- `GET /api/packages/images/[id]` - fetch an image for a package by ID

### Orders

- `GET /api/orders` - list orders
- `GET /api/orders/[id]` - view an order by ID
- `GET /api/orders/user` - list orders for current user
- `GET /api/orders/items/[id]` - view order items by order ID

### Shipment Requests

- `POST /api/shipment-requests` - create a shipment request
- `GET /api/shipment-requests` - list shipment requests
- `GET /api/shipment-requests/user` - list shipment requests for current user
- `GET /api/shipment-requests/[id]` - fetch a specific shipment request by ID

### Shipments

- `GET /api/shipments` - list shipments
- `POST /api/shipments` - create a shipment
- `GET /api/shipments/user` - list shipments for current user
- `POST /api/shipments/calculate-fee` - calculate shipment fee
- `GET /api/shipments/count` - get shipment count stats
- `PUT /api/shipments/shipment-status/[id]` - update a shipment status by ID
- `PUT /api/shipments/update-status` - update shipment status

### Products

- `GET /api/products` - list products
- `GET /api/products/[id]` - fetch a product by ID
- `GET /api/products/categories` - list product categories
- `GET /api/products/images/[id]` - fetch a product image by ID
- `POST /api/products` - create a product
- `PUT /api/products` - update a product

### Reviews

- `GET /api/reviews` - list reviews
- `POST /api/reviews` - create a review

### Pricing Methods

- `GET /api/pricing_methods/item-pricing` - get item pricing methods
- `PUT /api/pricing_methods/item-pricing` - update item pricing methods
- `GET /api/pricing_methods/shipping` - get shipping pricing methods
- `PUT /api/pricing_methods/shipping` - update shipping pricing methods
- `GET /api/pricing_methods/wrapping` - get wrapping pricing methods
- `PUT /api/pricing_methods/wrapping` - update wrapping pricing methods
- `GET /api/pricing_methods/others` - get other pricing methods
- `PUT /api/pricing_methods/others` - update other pricing methods

### Pricing Templates

- `GET /api/pricing_template/air` - air pricing template
- `GET /api/pricing_template/express` - express pricing template
- `GET /api/pricing_template/sea` - sea pricing template

### Payments

- `POST /api/payments/initialize` - initialize payment
- `GET /api/payments/user` - payment records for current user

### Paystack Integration

- `POST /api/paystack/initialize-payment` - initialize Paystack payment
- `GET /api/paystack/verify-payment/[reference]` - verify Paystack payment by reference

### Paystack Ecommerce Integration

- `POST /api/paystack-ecommerce/initialize-payment` - initialize ecommerce payment
- `GET /api/paystack-ecommerce/verify-payment/[reference]` - verify ecommerce payment by reference
- `POST /api/paystack-ecommerce/webhook` - Paystack ecommerce webhook receiver

### Monnify Integration

- `POST /api/monnify/initialize` - initialize Monnify payment
- `GET /api/monnify/verify/[reference]` - verify Monnify payment by reference
- `POST /api/monnify/webhooks` - Monnify webhook receiver

### Fulfillment & Shipping

- `GET /api/warehouses` - list warehouses
- `POST /api/warehouses` - create a warehouse
- `GET /api/warehouses/[id]` - fetch a warehouse by ID
- `GET /api/states` - list states
- `GET /api/money-exchange-rate` - get exchange rate data
- `POST /api/sign-cloudinary` - sign Cloudinary uploads
- `POST /api/upload-user-image` - upload user image
- `GET /api/env-test` - environment test route

## Application Features

- Admin dashboards for orders, shipments, packages, staff, warehouse, and users
- Customer-facing portal with order tracking, pending payments, profile management, and marketplace access
- Payment handling via Paystack, Paystack Ecommerce, and Monnify
- Shipping fee and pricing calculations
- Image upload support via Cloudinary
- Announcement and review management
- Address and user profile management

## Notes

- `lib/db/` contains database helpers and Postgres integration.
- `store/` contains client-side application state using Zustand.
- `components/` contains UI building blocks and feature-specific react components.
- `app/api` implements the REST API directly via Next.js route handlers.
- `assets/` stores static application data used in UI components.

## Recommended Next Steps

- Review `app/api` route handlers to add request/response contract documentation.
- Add environment setup details to `.env.example` with keys for database, Supabase, Cloudinary, Paystack, Monnify, and email provider.
- Document any database schema or migrations used by the application.
