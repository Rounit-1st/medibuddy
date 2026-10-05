import React from 'react'
import { formatField, extractArray } from '../services/fdaApi'

function MedicineCardComponent({ openfda, onClick }) {
  if (!openfda) return null

  // Safely extract openfda array fields
  const brandNames = extractArray(openfda.brand_name)
  const primaryBrand = brandNames[0] || 'Unknown Brand Name'
  const otherBrandNames = brandNames.slice(1)

  const genericName = formatField(openfda, 'generic_name', 'Generic name not listed')
  const manufacturer = formatField(openfda, 'manufacturer_name', 'Manufacturer not listed')
  const productType = formatField(openfda, 'product_type', 'OTC / Prescription')
  const route = formatField(openfda, 'route', 'Route not listed')
  const substances = extractArray(openfda.substance_name)
  const productNdc = extractArray(openfda.product_ndc)[0] || ''
  const pharmClass = extractArray(openfda.pharm_class_epc)[0] || extractArray(openfda.pharm_class_cs)[0] || ''

  // Is prescription or OTC
  const isRx = productType.toUpperCase().includes('PRESCRIPTION')
  const isOtc = productType.toUpperCase().includes('OTC')

  return (
    <button
      type="button"
      className="medicine-card"
      onClick={onClick}
      aria-label={`View details for ${primaryBrand}`}
    >
      <div className="card-badge-icon" aria-hidden="true">
        <span>💊</span>
      </div>

      <div className="card-main-info">
        <div className="card-title-row">
          <h3 className="card-brand-name">{primaryBrand}</h3>
          {otherBrandNames.length > 0 && (
            <span className="card-alias" title={`Also known as: ${otherBrandNames.join(', ')}`}>
              +{otherBrandNames.length} variant{otherBrandNames.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <p className="card-generic-name" title={genericName}>
          <span className="info-label">Generic: </span>
          {genericName}
        </p>

        <p className="card-manufacturer" title={manufacturer}>
          <span className="info-label">Mfg: </span>
          {manufacturer}
        </p>

        {substances.length > 0 && (
          <div className="card-substances">
            <span className="substance-label">Active:</span>
            <span className="substance-value">{substances.slice(0, 3).join(', ')}{substances.length > 3 ? '...' : ''}</span>
          </div>
        )}
      </div>

      <div className="card-tags-column">
        <div className="pill-group">
          {isRx && <span className="status-pill rx-pill">Rx Only</span>}
          {isOtc && <span className="status-pill otc-pill">OTC</span>}
          <span className="info-pill route-pill" title={`Route: ${route}`}>
            📍 {route}
          </span>
          {pharmClass && (
            <span className="info-pill class-pill" title={`Class: ${pharmClass}`}>
              🔬 {pharmClass}
            </span>
          )}
          {productNdc && (
            <span className="info-pill ndc-pill" title={`NDC: ${productNdc}`}>
              NDC: {productNdc}
            </span>
          )}
        </div>
      </div>

      <div className="card-action-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </button>
  )
}

export default React.memo(MedicineCardComponent)
