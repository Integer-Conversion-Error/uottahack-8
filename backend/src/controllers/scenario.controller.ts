// src/controllers/scenario.controller.ts

import { Request, Response } from 'express';
import Scenario from '../models/Scenario';

// Get all scenarios
export const getAllScenarios = async (req: Request, res: Response) => {
    try {
        const scenarios = await Scenario.find().select('-audio.voiceSettings');

        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scenarios'
        });
    }
};

// Get scenario by ID
export const getScenarioById = async (req: Request, res: Response) => {
    try {
        const { scenarioId } = req.params;

        const scenario = await Scenario.findById(scenarioId);
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        res.json({
            success: true,
            data: scenario
        });
    } catch (error) {
        console.error('Error fetching scenario:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scenario'
        });
    }
};

// Get scenarios by difficulty
export const getScenariosByDifficulty = async (req: Request, res: Response) => {
    try {
        const difficulty = Array.isArray(req.params.difficulty)
            ? req.params.difficulty[0]
            : req.params.difficulty;

        if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid difficulty level'
            });
        }

        const scenarios = await Scenario.find({ difficulty });

        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch scenarios'
        });
    }
};