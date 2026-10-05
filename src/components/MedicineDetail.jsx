import { useState, memo } from 'react'
import { formatField, extractArray } from '../services/fdaApi'

function MedicineDetailComponent({ item, onBack }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!item) return null

  const openfda = item.openfda || {}
  const brandNames = extractArray(openfda.brand_name)
  const primaryBrand = brandNames[0] || 'Medicine Information'
  const otherBrandNames = brandNames.slice(1)
  const genericName = formatField(openfda, 'generic_name', 'Generic name not listed')
  const manufacturer = formatField(openfda, 'manufacturer_name', 'Manufacturer not listed')
  const productType = formatField(openfda, 'product_type', 'Product type not listed')
  const route = formatField(openfda, 'route', 'Route not listed')
  const substances = extractArray(openfda.substance_name)
  const dosageForms = extractArray(openfda.dosage_form)
  const productNdc = extractArray(openfda.product_ndc)
  const packageNdc = extractArray(openfda.package_ndc)
  const appNumbers = extractArray(openfda.application_number)
  const pharmClasses = extractArray(openfda.pharm_class_epc).concat(extractArray(openfda.pharm_class_cs))
  const rxcuis = extractArray(openfda.rxcui)
  const splId = extractArray(openfda.spl_id)[0] || item.id || ''

  // Clinical / Label fields from API object
  const indications = extractArray(item.indications_and_usage || item.purpose)
  const dosageAndAdmin = extractArray(item.dosage_and_administration)
  const activeIngredients = extractArray(item.active_ingredient)
  const inactiveIngredients = extractArray(item.inactive_ingredient)
  const warnings = extractArray(item.warnings || item.boxed_warning)
  const doNotUse = extractArray(item.do_not_use)
  const askDoctor = extractArray(item.ask_doctor || item.ask_doctor_or_pharmacist)
  const stopUse = extractArray(item.stop_use)
  const pregnancy = extractArray(item.pregnancy_or_breast_feeding)
  const childrenWarning = extractArray(item.keep_out_of_reach_of_children)
  const storage = extractArray(item.storage_and_handling)

  return (
    <article className="medicine-detail-view">
      <div className="detail-navigation">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          aria-label="Back to search results"
        >
          <span className="back-arrow" aria-hidden="true">←</span>
          <span>Back to Search Results</span>
        </button>
      </div>

      <header className="detail-header-card">
        <div className="detail-header-top">
          <div className="header-badges">
            <span className="pill header-type-pill">{productType}</span>
            {route !== 'Not listed' && <span className="pill header-route-pill">📍 {route}</span>}
            {productNdc.length > 0 && <span className="pill header-ndc-pill">NDC: {productNdc[0]}</span>}
          </div>
          <p className="detail-eyebrow">FDA APPROVED MEDICINE</p>
          <h1 className="detail-title">{primaryBrand}</h1>
          <p className="detail-generic">
            <strong>Generic Name: </strong>{genericName}
          </p>
          {otherBrandNames.length > 0 && (
            <p className="detail-aliases">
              <span className="info-label">Also marketed as: </span>
              {otherBrandNames.join(', ')}
            </p>
          )}
        </div>

        <div className="detail-header-stats">
          <div className="stat-box">
            <span className="stat-label">Manufacturer</span>
            <span className="stat-value">{manufacturer}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Administration Route</span>
            <span className="stat-value">{route}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Active Substance</span>
            <span className="stat-value">{substances.join(', ') || 'Not specified'}</span>
          </div>
        </div>
      </header>

      {/* Tabs navigation for deep medical info */}
      <nav className="detail-tabs-bar" aria-label="Medicine information sections">
        <button
          type="button"
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏷️ OpenFDA Specs
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('usage')}
        >
          📋 Usage & Dosage
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          ⚠️ Warnings & Safety
        </button>
      </nav>

      {/* Tab 1: OpenFDA Specifications */}
      {activeTab === 'overview' && (
        <section className="tab-panel openfda-specs-panel">
          <div className="specs-section-header">
            <h2>Product & Regulatory Information</h2>
            <p>Official registry metadata provided under OpenFDA.</p>
          </div>

          <div className="specs-grid">
            <SpecCard label="Brand Name" value={brandNames.join(', ') || 'Not listed'} />
            <SpecCard label="Generic Name" value={genericName} />
            <SpecCard label="Manufacturer / Labeler" value={manufacturer} />
            <SpecCard label="Product Type" value={productType} />
            <SpecCard label="Route of Administration" value={route} />
            <SpecCard label="Dosage Form" value={dosageForms.join(', ') || 'Not listed'} />
            <SpecCard label="Active Substance / Chemical" value={substances.join(', ') || 'Not listed'} />
            <SpecCard label="Product NDC Code(s)" value={productNdc.join(', ') || 'Not listed'} />
            <SpecCard label="Package NDC Code(s)" value={packageNdc.join(', ') || 'Not listed'} />
            <SpecCard label="Application Number (NDA/ANDA)" value={appNumbers.join(', ') || 'Not listed'} />
            <SpecCard label="Pharmacologic Class" value={pharmClasses.join('; ') || 'Not listed'} />
            <SpecCard label="RxNorm CUI" value={rxcuis.join(', ') || 'Not listed'} />
            {splId && <SpecCard label="FDA SPL Document ID" value={splId} />}
          </div>
        </section>
      )}

      {/* Tab 2: Usage & Dosage */}
      {activeTab === 'usage' && (
        <section className="tab-panel usage-panel">
          <div className="specs-section-header">
            <h2>Indications, Dosage & Ingredients</h2>
            <p>Instructions for patient administration and formula details.</p>
          </div>

          <div className="clinical-sections">
            <ClinicalSection
              title="Indications & Purpose"
              content={indications}
              fallback="Specific indication details were not provided in this label summary."
              icon="🎯"
            />
            <ClinicalSection
              title="Dosage & Administration"
              content={dosageAndAdmin}
              fallback="Consult your healthcare provider or package instructions for dosing."
              icon="⏱️"
            />
            <ClinicalSection
              title="Active Ingredients"
              content={activeIngredients.length > 0 ? activeIngredients : substances}
              fallback="Active ingredients not specified in label text."
              icon="🧪"
            />
            <ClinicalSection
              title="Inactive Ingredients"
              content={inactiveIngredients}
              fallback="Inactive ingredients not specified."
              icon="🌿"
            />
            <ClinicalSection
              title="Storage & Handling"
              content={storage}
              fallback="Store at room temperature away from direct moisture and heat."
              icon="📦"
            />
          </div>
        </section>
      )}

      {/* Tab 3: Safety & Warnings */}
      {activeTab === 'safety' && (
        <section className="tab-panel safety-panel">
          <div className="specs-section-header">
            <h2>Safety Precautions & Warnings</h2>
            <p>Critical contraindications, adverse warnings, and storage alerts.</p>
          </div>

          <div className="clinical-sections">
            <ClinicalSection
              title="Important Warnings"
              content={warnings}
              alertLevel="warning"
              fallback="No specific major boxed warnings listed in summary."
              icon="⚠️"
            />
            <ClinicalSection
              title="Do Not Use"
              content={doNotUse}
              alertLevel="danger"
              fallback="No absolute contraindications listed in summary."
              icon="🚫"
            />
            <ClinicalSection
              title="Ask a Doctor Before Use"
              content={askDoctor}
              fallback="Consult a physician or pharmacist if you have pre-existing conditions."
              icon="🩺"
            />
            <ClinicalSection
              title="Stop Use and Consult Doctor If"
              content={stopUse}
              alertLevel="warning"
              fallback="Discontinue use and seek medical attention if symptoms persist or allergic reactions occur."
              icon="🛑"
            />
            <ClinicalSection
              title="Pregnancy & Breastfeeding Warning"
              content={pregnancy}
              fallback="If pregnant or nursing, consult a healthcare professional before use."
              icon="👶"
            />
            <ClinicalSection
              title="Keep Out of Reach of Children"
              content={childrenWarning}
              fallback="Keep this and all medications out of reach of children."
              icon="🔒"
            />
          </div>
        </section>
      )}

      <footer className="detail-footer-note">
        <p>
          ⚠️ <strong>Medical Disclaimer:</strong> Information provided is sourced from FDA Open Data records and is for informational purposes only. Always consult a qualified medical professional before taking any medication.
        </p>
      </footer>
    </article>
  )
}

function SpecCard({ label, value }) {
  return (
    <div className="spec-card">
      <span className="spec-label">{label}</span>
      <strong className="spec-value">{value}</strong>
    </div>
  )
}

function ClinicalSection({ title, content, fallback, alertLevel = 'normal', icon }) {
  const textArray = extractArray(content)
  const hasContent = textArray.length > 0 && textArray.some((t) => t.trim().length > 0)

  return (
    <div className={`clinical-card alert-${alertLevel}`}>
      <div className="clinical-card-header">
        <span className="clinical-icon" aria-hidden="true">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="clinical-card-body">
        {hasContent ? (
          textArray.map((paragraph, index) => (
            <p key={index} className="clinical-paragraph">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="clinical-fallback">{fallback}</p>
        )}
      </div>
    </div>
  )
}

export default memo(MedicineDetailComponent)
