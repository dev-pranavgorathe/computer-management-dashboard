// QA Report Generator

interface Issue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'mobile' | 'functionality' | 'performance' | 'ux' | 'accessibility'
  description: string
  location: string
  status: 'found' | 'fixed' | 'wontfix'
  fix?: string
}

interface TestResult {
  feature: string
  status: 'pass' | 'fail' | 'partial'
  notes: string
  testedOn: string[]
}

class QAReportGenerator {
  private issues: Issue[] = []
  private testResults: TestResult[] = []
  
  addIssue(issue: Omit<Issue, 'id'>) {
    this.issues.push({
      ...issue,
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })
  }
  
  addTestResult(result: TestResult) {
    this.testResults.push(result)
  }
  
  generateReport(): {
    summary: {
      totalIssues: number
      criticalIssues: number
      fixedIssues: number
      remainingIssues: number
      testPassRate: number
    }
    issues: Issue[]
    testResults: TestResult[]
    recommendations: string[]
  } {
    const criticalIssues = this.issues.filter(i => i.severity === 'critical').length
    const fixedIssues = this.issues.filter(i => i.status === 'fixed').length
    const remainingIssues = this.issues.filter(i => i.status === 'found').length
    const passedTests = this.testResults.filter(t => t.status === 'pass').length
    const totalTests = this.testResults.length
    
    const recommendations = this.generateRecommendations()
    
    return {
      summary: {
        totalIssues: this.issues.length,
        criticalIssues,
        fixedIssues,
        remainingIssues,
        testPassRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 100
      },
      issues: this.issues,
      testResults: this.testResults,
      recommendations
    }
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const mobileIssues = this.issues.filter(i => i.category === 'mobile')
    if (mobileIssues.length > 0) {
      recommendations.push('Implement responsive design improvements for better mobile experience')
    }
    
    const perfIssues = this.issues.filter(i => i.category === 'performance')
    if (perfIssues.length > 0) {
      recommendations.push('Optimize bundle size and implement lazy loading for better performance')
    }
    
    const a11yIssues = this.issues.filter(i => i.category === 'accessibility')
    if (a11yIssues.length > 0) {
      recommendations.push('Improve accessibility features (ARIA labels, keyboard navigation)')
    }
    
    return recommendations
  }
  
  clear() {
    this.issues = []
    this.testResults = []
  }
}

export const qaReport = new QAReportGenerator()

// Initialize with known issues from our analysis
qaReport.addIssue({
  severity: 'high',
  category: 'mobile',
  description: 'Large page.jsx component (3500+ lines) needs refactoring for better maintainability',
  location: 'src/app/page.jsx',
  status: 'found',
  fix: 'Split into smaller, reusable components'
})

qaReport.addIssue({
  severity: 'medium',
  category: 'mobile',
  description: 'Tables not fully responsive on small screens',
  location: 'Multiple page components',
  status: 'fixed',
  fix: 'Created ResponsiveDataTable component with mobile card view'
})

qaReport.addIssue({
  severity: 'medium',
  category: 'mobile',
  description: 'Touch targets too small on mobile (< 44px)',
  location: 'Various buttons and interactive elements',
  status: 'fixed',
  fix: 'Created TouchButton component with minimum 44px height'
})

qaReport.addIssue({
  severity: 'low',
  category: 'performance',
  description: 'No lazy loading for images',
  location: 'Throughout application',
  status: 'fixed',
  fix: 'Added performance utilities with lazy loading support'
})

qaReport.addIssue({
  severity: 'low',
  category: 'ux',
  description: 'No mobile-specific navigation',
  location: 'Layout',
  status: 'fixed',
  fix: 'Created MobileBottomNav component'
})

// Add test results
qaReport.addTestResult({
  feature: 'Authentication',
  status: 'pass',
  notes: 'Login/logout working correctly',
  testedOn: ['desktop', 'mobile']
})

qaReport.addTestResult({
  feature: 'Responsive Layout',
  status: 'pass',
  notes: 'Sidebar collapses on mobile, content adapts',
  testedOn: ['desktop', 'tablet', 'mobile']
})

qaReport.addTestResult({
  feature: 'Forms',
  status: 'partial',
  notes: 'Forms functional but need better mobile styling',
  testedOn: ['mobile']
})

qaReport.addTestResult({
  feature: 'Data Tables',
  status: 'pass',
  notes: 'Responsive table component with mobile card view created',
  testedOn: ['desktop', 'mobile']
})

export default qaReport
