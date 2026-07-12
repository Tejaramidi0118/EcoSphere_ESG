# EcoSphere — Seed Data (paste into `seed.js`)

Goal: make the demo look like a real company from second one. Use these directly.

## Departments
| Name | Code | Head | Parent | Employees |
|---|---|---|---|---|
| Manufacturing | MFG | S. Nair | — | 134 |
| Logistics | LOG | R. Iyer | Manufacturing | 58 |
| Corporate | COR | A. Mehta | — | 41 |
| R&D | RND | P. Singh | — | 22 |
| Sales | SLS | D. Kapoor | — | 30 |

## Employees (mix of admin/employee, spread across departments)
- Admin: `admin@ecosphere.io` / password `admin123` (Corporate)
- Priya Sharma (Manufacturing, employee)
- Aditi Rao (Manufacturing, employee)
- Karan Shah (R&D, employee)
- R. Iyer (Logistics, employee — also dept head)
- S. Nair (Manufacturing, employee — also dept head)
- 3–4 more filler employees across Sales/Corporate for leaderboard depth

## Emission Factors (DEFRA/EPA-style, realistic units — cite as "DEFRA 2024 factors" in report footer)
| Name | Unit | CO2 per unit |
|---|---|---|
| Diesel (fleet) | litre | 2.68 kg CO2e |
| Grid Electricity (India avg) | kWh | 0.82 kg CO2e |
| Natural Gas | m³ | 2.02 kg CO2e |
| Air Freight | tonne-km | 0.60 kg CO2e |
| Road Freight | tonne-km | 0.10 kg CO2e |
| Packaging (cardboard) | kg | 0.94 kg CO2e |

(Reference for real numbers if you want to double check: UK DEFRA GHG Conversion Factors, published annually — search "DEFRA conversion factors 2024/2025" for the current table.)

## Environmental Goals
| Name | Department | Target CO2 | Current CO2 | Deadline | Status |
|---|---|---|---|---|---|
| Reduce Fleet Emissions | Logistics | 500 t | 390 t | 2026-12-31 | Active |
| Cut Packaging Waste | Manufacturing | 120 t | 98 t | 2026-09-30 | On Track |
| Office Energy Cut | Corporate | 80 t | 80 t | 2026-06-30 | Completed |

## CSR Activity Categories & Activities
- Tree Plantation (24 joined, evidence required)
- Blood Donation (18 joined, evidence required)
- Beach Cleanup (31 joined, open)
- ESG Workshop (52 joined, open)

## Employee Participation (sample rows)
| Employee | Activity | Proof | Points | Status |
|---|---|---|---|---|
| Aditi Rao | Tree Plantation | photo.jpg | 50 | Pending |
| Karan Shah | ESG Workshop | cert.pdf | 30 | Approved |

## Policies
- Anti-Corruption Policy (org-wide)
- Data Privacy Policy (org-wide)
- Fair Labor Practices (Manufacturing)

## Audits
| Title | Department | Auditor | Date | Findings | Status |
|---|---|---|---|---|---|
| Q2 Waste Audit | Manufacturing | S. Nair | 2026-06-12 | 3 minor issues | Completed |
| Vendor Compliance Check | Procurement | R. Iyer | 2026-07-01 | 1 open issue | Under Review |

## Compliance Issues
| Issue | Severity | Department | Status |
|---|---|---|---|
| Missing MSDS sheets | High | Manufacturing | Open |
| Late vendor disclosure | Medium | Procurement | Resolved |

## Challenges
| Title | XP | Difficulty | Deadline | Status |
|---|---|---|---|---|
| Sustainability Sprint | 200 | Hard | 2026-07-20 | Active |
| Recycle Challenge | 80 | Easy | 2026-07-15 | Active |
| Commute Green Week | 120 | Medium | 2026-07-25 | Draft |

## Badges (unlock rules)
| Name | Unlock Rule |
|---|---|
| Green Beginner | xp >= 50 |
| Carbon Saver | xp >= 200 |
| Sustainability Champion | xp >= 500 |
| Team Player | completed_challenges >= 3 |

## Leaderboard seed (so it's not empty on first load)
| Rank | Entity | XP |
|---|---|---|
| 1 | Manufacturing Dept | 4,820 |
| 2 | Aditi Rao | 3,910 |
| 3 | Corporate Dept | 3,505 |

## Rewards
| Name | Points Required | Stock |
|---|---|---|
| Eco Tote Bag | 100 | 50 |
| Extra Day Off | 1000 | 5 |
| Company Swag Pack | 300 | 20 |

---
**Tip:** write this as one `seed.js` that runs `prisma db seed` (or equivalent) so both devs can reset to identical, demo-ready data with one command at any checkpoint.
