-- Financial Management System Migration
-- This migration creates comprehensive financial management for barangay operations

-- =============================================
-- BUDGET CATEGORIES
-- =============================================

CREATE TABLE budget_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES budget_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default budget categories
INSERT INTO budget_categories (category_code, category_name, description) VALUES
('PERS', 'Personal Services', 'Salaries, wages, and employee benefits'),
('MAINT', 'Maintenance and Operations', 'Office supplies, utilities, and operational expenses'),
('CAP', 'Capital Outlay', 'Equipment, infrastructure, and major purchases'),
('REV', 'Revenue', 'Income from fees, taxes, and other sources'),
('PROJ', 'Projects', 'Special projects and programs'),
('EMERG', 'Emergency Fund', 'Emergency and contingency expenses');

-- =============================================
-- ANNUAL BUDGETS
-- =============================================

CREATE TABLE annual_budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Active', 'Closed')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fiscal_year)
);

-- =============================================
-- BUDGET LINE ITEMS
-- =============================================

CREATE TABLE budget_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    annual_budget_id UUID REFERENCES annual_budgets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES budget_categories(id) NOT NULL,
    line_item_code VARCHAR(50) NOT NULL,
    line_item_name VARCHAR(200) NOT NULL,
    description TEXT,
    allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    committed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(annual_budget_id, line_item_code)
);

-- =============================================
-- REVENUE SOURCES
-- =============================================

CREATE TABLE revenue_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_code VARCHAR(20) UNIQUE NOT NULL,
    source_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    default_amount DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default revenue sources
INSERT INTO revenue_sources (source_code, source_name, description, is_recurring, default_amount) VALUES
('DOC_FEES', 'Document Fees', 'Fees from barangay clearance, certificates, etc.', true, 0),
('BUS_PERMIT', 'Business Permit Fees', 'Fees from business permits and licenses', true, 0),
('FINES', 'Fines and Penalties', 'Fines from violations and penalties', false, 0),
('DONATIONS', 'Donations', 'Donations from individuals and organizations', false, 0),
('GRANTS', 'Government Grants', 'Grants from national and local government', false, 0),
('EVENTS', 'Event Fees', 'Fees from barangay events and activities', false, 0);

-- =============================================
-- REVENUE TRANSACTIONS
-- =============================================

CREATE TABLE revenue_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    revenue_source_id UUID REFERENCES revenue_sources(id) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    payer_name VARCHAR(200),
    payer_contact VARCHAR(100),
    description TEXT,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Cancelled', 'Refunded')),
    collected_by UUID REFERENCES auth.users(id),
    related_entity_type VARCHAR(50), -- document_request, business_permit, etc.
    related_entity_id UUID,
    receipt_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EXPENSE TRANSACTIONS
-- =============================================

CREATE TABLE expense_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    budget_line_item_id UUID REFERENCES budget_line_items(id),
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    vendor_name VARCHAR(200),
    vendor_contact VARCHAR(100),
    description TEXT NOT NULL,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Cancelled')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_by UUID REFERENCES auth.users(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    receipt_number VARCHAR(50),
    invoice_number VARCHAR(50),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENT METHODS
-- =============================================

CREATE TABLE payment_methods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    method_code VARCHAR(20) UNIQUE NOT NULL,
    method_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    requires_reference BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO payment_methods (method_code, method_name, description, requires_reference) VALUES
('CASH', 'Cash', 'Cash payment', false),
('CHECK', 'Check', 'Check payment', true),
('BANK_TRANSFER', 'Bank Transfer', 'Bank transfer or deposit', true),
('GCASH', 'GCash', 'GCash mobile payment', true),
('PAYMAYA', 'PayMaya', 'PayMaya digital wallet', true),
('ONLINE', 'Online Payment', 'Online payment gateway', true);

-- =============================================
-- FINANCIAL REPORTS
-- =============================================

CREATE TABLE financial_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    report_period VARCHAR(50) NOT NULL, -- monthly, quarterly, annual
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES auth.users(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path VARCHAR(500),
    is_official BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- PETTY CASH FUND
-- =============================================

CREATE TABLE petty_cash_fund (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fund_name VARCHAR(100) NOT NULL,
    initial_amount DECIMAL(12,2) NOT NULL,
    current_balance DECIMAL(12,2) NOT NULL,
    custodian_id UUID REFERENCES auth.users(id) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PETTY CASH TRANSACTIONS
-- =============================================

CREATE TABLE petty_cash_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fund_id UUID REFERENCES petty_cash_fund(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Replenishment', 'Expense', 'Return')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    recipient_name VARCHAR(200),
    receipt_number VARCHAR(50),
    transaction_date DATE NOT NULL,
    processed_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Budget categories indexes
CREATE INDEX idx_budget_categories_parent ON budget_categories(parent_category_id);
CREATE INDEX idx_budget_categories_active ON budget_categories(is_active);

-- Annual budgets indexes
CREATE INDEX idx_annual_budgets_fiscal_year ON annual_budgets(fiscal_year);
CREATE INDEX idx_annual_budgets_status ON annual_budgets(status);

-- Budget line items indexes
CREATE INDEX idx_budget_line_items_budget_id ON budget_line_items(annual_budget_id);
CREATE INDEX idx_budget_line_items_category_id ON budget_line_items(category_id);

-- Revenue transactions indexes
CREATE INDEX idx_revenue_transactions_source_id ON revenue_transactions(revenue_source_id);
CREATE INDEX idx_revenue_transactions_date ON revenue_transactions(transaction_date DESC);
CREATE INDEX idx_revenue_transactions_status ON revenue_transactions(status);
CREATE INDEX idx_revenue_transactions_collected_by ON revenue_transactions(collected_by);

-- Expense transactions indexes
CREATE INDEX idx_expense_transactions_line_item_id ON expense_transactions(budget_line_item_id);
CREATE INDEX idx_expense_transactions_date ON expense_transactions(transaction_date DESC);
CREATE INDEX idx_expense_transactions_status ON expense_transactions(status);
CREATE INDEX idx_expense_transactions_created_by ON expense_transactions(created_by);

-- Financial reports indexes
CREATE INDEX idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX idx_financial_reports_period ON financial_reports(period_start, period_end);
CREATE INDEX idx_financial_reports_generated_by ON financial_reports(generated_by);

-- Petty cash indexes
CREATE INDEX idx_petty_cash_fund_custodian ON petty_cash_fund(custodian_id);
CREATE INDEX idx_petty_cash_transactions_fund_id ON petty_cash_transactions(fund_id);
CREATE INDEX idx_petty_cash_transactions_date ON petty_cash_transactions(transaction_date DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update triggers
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annual_budgets_updated_at BEFORE UPDATE ON annual_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_line_items_updated_at BEFORE UPDATE ON budget_line_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_sources_updated_at BEFORE UPDATE ON revenue_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_transactions_updated_at BEFORE UPDATE ON revenue_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_transactions_updated_at BEFORE UPDATE ON expense_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_petty_cash_fund_updated_at BEFORE UPDATE ON petty_cash_fund FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update budget line item spent amount when expense is approved
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
        UPDATE budget_line_items 
        SET spent_amount = spent_amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.budget_line_item_id;
    ELSIF OLD.status = 'Paid' AND NEW.status != 'Paid' THEN
        UPDATE budget_line_items 
        SET spent_amount = spent_amount - OLD.amount,
            updated_at = NOW()
        WHERE id = OLD.budget_line_item_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_update_budget_trigger
    AFTER UPDATE ON expense_transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_spent_amount();

-- Update petty cash balance
CREATE OR REPLACE FUNCTION update_petty_cash_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'Expense' THEN
        UPDATE petty_cash_fund 
        SET current_balance = current_balance - NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.fund_id;
    ELSIF NEW.transaction_type = 'Replenishment' THEN
        UPDATE petty_cash_fund 
        SET current_balance = current_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.fund_id;
    ELSIF NEW.transaction_type = 'Return' THEN
        UPDATE petty_cash_fund 
        SET current_balance = current_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.fund_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER petty_cash_balance_trigger
    AFTER INSERT ON petty_cash_transactions
    FOR EACH ROW EXECUTE FUNCTION update_petty_cash_balance();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to get financial summary for a period
CREATE OR REPLACE FUNCTION get_financial_summary(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_revenue DECIMAL(15,2),
    total_expenses DECIMAL(15,2),
    net_income DECIMAL(15,2),
    revenue_by_source JSONB,
    expenses_by_category JSONB
) AS $$
DECLARE
    v_total_revenue DECIMAL(15,2);
    v_total_expenses DECIMAL(15,2);
    v_revenue_by_source JSONB;
    v_expenses_by_category JSONB;
BEGIN
    -- Calculate total revenue
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM revenue_transactions
    WHERE transaction_date BETWEEN p_start_date AND p_end_date
    AND status = 'Completed';
    
    -- Calculate total expenses
    SELECT COALESCE(SUM(amount), 0) INTO v_total_expenses
    FROM expense_transactions
    WHERE transaction_date BETWEEN p_start_date AND p_end_date
    AND status = 'Paid';
    
    -- Revenue by source
    SELECT COALESCE(
        jsonb_object_agg(rs.source_name, COALESCE(rev_sum.total, 0)),
        '{}'::jsonb
    ) INTO v_revenue_by_source
    FROM revenue_sources rs
    LEFT JOIN (
        SELECT revenue_source_id, SUM(amount) as total
        FROM revenue_transactions
        WHERE transaction_date BETWEEN p_start_date AND p_end_date
        AND status = 'Completed'
        GROUP BY revenue_source_id
    ) rev_sum ON rs.id = rev_sum.revenue_source_id;
    
    -- Expenses by category
    SELECT COALESCE(
        jsonb_object_agg(bc.category_name, COALESCE(exp_sum.total, 0)),
        '{}'::jsonb
    ) INTO v_expenses_by_category
    FROM budget_categories bc
    LEFT JOIN budget_line_items bli ON bc.id = bli.category_id
    LEFT JOIN (
        SELECT budget_line_item_id, SUM(amount) as total
        FROM expense_transactions
        WHERE transaction_date BETWEEN p_start_date AND p_end_date
        AND status = 'Paid'
        GROUP BY budget_line_item_id
    ) exp_sum ON bli.id = exp_sum.budget_line_item_id
    WHERE bc.parent_category_id IS NULL;
    
    RETURN QUERY SELECT 
        v_total_revenue,
        v_total_expenses,
        v_total_revenue - v_total_expenses,
        v_revenue_by_source,
        v_expenses_by_category;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE budget_categories IS 'Budget categories for organizing expenses';
COMMENT ON TABLE annual_budgets IS 'Annual budget allocations and approvals';
COMMENT ON TABLE budget_line_items IS 'Detailed budget line items with allocations and spending';
COMMENT ON TABLE revenue_sources IS 'Sources of barangay revenue';
COMMENT ON TABLE revenue_transactions IS 'Individual revenue transactions and collections';
COMMENT ON TABLE expense_transactions IS 'Individual expense transactions and payments';
COMMENT ON TABLE payment_methods IS 'Available payment methods for transactions';
COMMENT ON TABLE financial_reports IS 'Generated financial reports and statements';
COMMENT ON TABLE petty_cash_fund IS 'Petty cash fund management';
COMMENT ON TABLE petty_cash_transactions IS 'Petty cash transactions and expenses';
