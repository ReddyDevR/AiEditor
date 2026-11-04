/**
 * REDDY AI STUDIO - Claude-Style Chat API Routes
 * Handles natural language instructions, multi-turn editing context,
 * Telugu, English & Roman Telugu NLP, and structured plan approvals.
 */

const express = require('express');
const router = express.Router();
const { agentOrchestrator } = require('../agents/orchestrator');
const { projectsStore } = require('../database/jsonStore');

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { projectId, message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    let project = null;
    if (projectId) {
      project = projectsStore.findById(projectId);
    }

    // Process through central AI Orchestrator
    const orchestratorResult = await agentOrchestrator.processInstruction(
      message,
      project,
      history || []
    );

    // Save message to project conversation history if project exists
    if (project) {
      const userMsg = {
        id: `msg_u_${Date.now()}`,
        role: 'user',
        text: message,
        timestamp: new Date().toISOString()
      };
      const assistantMsg = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        text: orchestratorResult.conversationalResponse,
        plan: orchestratorResult.plan,
        timestamp: new Date().toISOString()
      };

      const updatedConv = [...(project.conversation || []), userMsg, assistantMsg];
      projectsStore.update(project.id, { conversation: updatedConv });
    }

    return res.json({
      success: true,
      conversationalResponse: orchestratorResult.conversationalResponse,
      plan: orchestratorResult.plan,
      detectedLanguage: orchestratorResult.detectedLanguage,
      detectedAspectRatio: orchestratorResult.detectedAspectRatio,
      operations: orchestratorResult.operations
    });
  } catch (err) {
    console.error('[ChatRoutes] Error processing chat message:', err);
    return res.status(500).json({ error: 'Failed to process instructions: ' + err.message });
  }
});

// POST /api/chat/approve-plan
router.post('/approve-plan', async (req, res) => {
  try {
    const { projectId, plan } = req.body;
    if (!projectId || !plan) {
      return res.status(400).json({ error: 'projectId and plan are required.' });
    }

    const project = projectsStore.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Apply plan to timeline
    const updatedProject = agentOrchestrator.applyPlanToTimeline(project, plan);
    projectsStore.update(projectId, updatedProject);

    return res.json({
      success: true,
      message: 'Plan approved and applied to project timeline.',
      project: updatedProject
    });
  } catch (err) {
    console.error('[ChatRoutes] Error approving plan:', err);
    return res.status(500).json({ error: 'Failed to approve plan: ' + err.message });
  }
});

module.exports = router;
