const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.get('/challenges', gamificationController.getChallenges);
router.post('/challenge-participation', gamificationController.joinChallenge);
router.get('/challenge-participation/my', gamificationController.getMyParticipations);
router.put('/challenge-participation/:id/submit', gamificationController.submitChallengeProof);
router.get('/challenge-participation/pending', isAdmin, gamificationController.getPendingParticipations);
router.put('/challenge-participation/:id/approve', isAdmin, gamificationController.approveChallengeParticipation);
router.get('/redemptions', isAdmin, gamificationController.getRedemptions);
router.get('/badges', gamificationController.getBadges);
router.get('/my-badges', gamificationController.getMyBadges);
router.get('/rewards', gamificationController.getRewards);
router.post('/rewards/:id/redeem', gamificationController.redeemReward);
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;
