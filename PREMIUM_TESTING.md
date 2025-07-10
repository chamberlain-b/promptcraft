# Premium Workflow Testing Guide

## 🚀 Overview

This guide explains how to test the new Premium Workflow system in Prompt Craft. The system includes multi-step AI workflows, subscription tiers, and advanced prompt generation.

## 🧪 Testing the Premium Features

### 1. **Basic Setup**

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (usually `http://localhost:5173`)

### 2. **Testing Subscription Tiers**

**Note: For testing phase, all features are enabled regardless of subscription tier.**

The app includes test buttons to switch between subscription tiers (for UI testing):

- **Free Tier**: Basic prompt enhancement only
- **Pro Tier**: Multi-step workflows (up to 5 steps)
- **Enterprise Tier**: Unlimited workflows and all features

**To switch tiers:**
- Look for the tier buttons in the Premium Workflow section
- Click "Free", "Pro", or "Enterprise" to test different features
- The system will immediately update to reflect the new tier
- **All features work in all tiers during testing**

### 3. **Testing Multi-Step Workflows**

#### **Step 1: Enter a Complex Request**
Try these example inputs that will trigger multi-step workflows:

- **App Development**: "build a task management app"
- **AI Integration**: "integrate AI chatbot into website"
- **Business Strategy**: "create a business plan for a startup"
- **Content Marketing**: "develop a content marketing strategy"

#### **Step 2: Activate Premium Workflow**
1. Enter your request in the main input field
2. Click the **"Premium"** button (gold/orange button with crown icon)
3. The Premium Workflow interface will appear

#### **Step 3: Analyze Requirements**
1. Click **"Analyze Requirements"** to start the workflow
2. The system will analyze your request and determine:
   - Project type and complexity
   - Required steps
   - Estimated time
   - Recommended AI models

#### **Step 4: Execute Workflow**
1. Review the generated workflow steps
2. Click **"Execute Workflow"** to run all steps
3. Watch the real-time progress as each step completes
4. View individual step outputs by clicking "View" on completed steps

### 4. **Workflow Templates**

The system includes 4 pre-built workflow templates:

1. **App Development** (5 steps)
   - Requirements Analysis
   - Architecture Design
   - Frontend Design
   - Backend Development
   - Integration Plan

2. **AI Integration** (4 steps)
   - AI Capability Assessment
   - Model Selection
   - Integration Architecture
   - Implementation Plan

3. **Business Strategy** (4 steps)
   - Market Analysis
   - Business Model Design
   - Go-to-Market Strategy
   - Financial Planning

4. **Content Creation** (4 steps)
   - Content Strategy
   - Content Calendar
   - Content Templates
   - Distribution Plan

### 5. **Testing Different Scenarios**

#### **Free Tier Testing**
- Enter a complex request
- Try to access Premium Workflow
- **Should work without restrictions (testing mode)**
- Basic prompt enhancement should still work

#### **Pro Tier Testing**
- Switch to Pro tier
- Test multi-step workflows
- Verify 5-step limit
- Test workflow execution

#### **Enterprise Tier Testing**
- Switch to Enterprise tier
- Test unlimited workflows
- Verify all features available

### 6. **Key Features to Test**

#### **Real-time Progress Tracking**
- Watch step status updates
- Monitor progress percentage
- View execution timestamps

#### **Step Dependencies**
- Some steps depend on others
- Verify proper execution order
- Test dependency management

#### **Output Management**
- Expand/collapse step outputs
- Copy individual step results
- Export complete workflow

#### **Error Handling**
- Test with invalid inputs
- Verify graceful error handling
- Check error state display

### 7. **API Integration Testing**

#### **Current Implementation**
- Uses existing OpenAI API (`/api/generate`)
- All steps use the same API endpoint
- No premium API calls during testing
- Graceful fallback to local analysis if API fails

#### **Future Integration**
- Add API keys for other providers
- Test with real Claude/Anthropic API
- Test with real Google/Gemini API

### 8. **Troubleshooting**

#### **Common Issues**

1. **Workflow not starting**
   - Check if input is provided
   - Verify subscription tier
   - Check browser console for errors

2. **Steps not executing**
   - Verify API key is set
   - Check network connectivity
   - Review browser console

3. **UI not updating**
   - Refresh the page
   - Clear browser cache
   - Check for JavaScript errors

#### **Debug Information**
- Open browser developer tools
- Check Console tab for errors
- Monitor Network tab for API calls
- Review Application tab for localStorage

### 9. **Performance Testing**

#### **Response Times**
- Monitor step execution times
- Test with different input lengths
- Verify timeout handling

#### **Memory Usage**
- Test with multiple workflows
- Monitor browser memory usage
- Check for memory leaks

### 10. **Next Steps for Production**

#### **Payment Integration**
- Integrate Stripe for payments
- Add user authentication
- Implement usage tracking

#### **Advanced Features**
- Custom workflow templates
- Team collaboration
- API access for integrations
- Advanced analytics

## 🎯 Success Criteria

A successful test should demonstrate:

✅ **Multi-step workflow creation and execution**
✅ **Real-time progress tracking**
✅ **Subscription tier restrictions**
✅ **Step dependency management**
✅ **Output viewing and export**
✅ **Error handling and recovery**
✅ **UI responsiveness and usability**

## 📝 Notes

- This is a test implementation
- Uses existing `/api/generate` endpoint for all AI calls
- Subscription tiers are for UI testing only (all features enabled)
- No actual payment processing
- All data is stored locally
- Premium APIs are simulated/disabled for testing phase

## 🔧 Development Notes

- Workflow service: `src/services/workflowService.js`
- Premium LLM service: `src/services/premiumLlmService.js`
- Subscription service: `src/services/subscriptionService.js`
- Premium workflow component: `src/components/PremiumWorkflow.jsx`
- Premium API endpoint: `api/premium/generate.js` 