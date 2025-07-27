'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Person,
  SmartToy,
  Check,
  Close,
} from '@mui/icons-material';
import { useIntl } from 'react-intl';

interface Proposal {
  id: string;
  content: string;
  type: 'teacher' | 'agent';
  status: 'pending' | 'accepted' | 'rejected';
}

interface NegotiationDialogProps {
  open: boolean;
  onClose: () => void;
  proposals: Proposal[];
  onProposalAction: (proposalId: string, action: 'accept' | 'reject') => void;
}

export default function NegotiationDialog({
  open,
  onClose,
  proposals,
  onProposalAction,
}: NegotiationDialogProps) {
  const intl = useIntl();
  const [agreementReached, setAgreementReached] = useState(false);

  const teacherProposals = proposals.filter(p => p.type === 'teacher');
  const agentProposals = proposals.filter(p => p.type === 'agent');

  const handleProposalAction = (proposalId: string, action: 'accept' | 'reject') => {
    onProposalAction(proposalId, action);
    
    // Check if agreement is reached (at least one proposal accepted by each side)
    const hasTeacherAccepted = teacherProposals.some(p => p.status === 'accepted');
    const hasAgentAccepted = agentProposals.some(p => p.status === 'accepted');
    
    if (hasTeacherAccepted && hasAgentAccepted) {
      setAgreementReached(true);
    }
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted':
        return <Check />;
      case 'rejected':
        return <Close />;
      default:
        return undefined;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {intl.formatMessage({ id: 'agent.negotiation' })}
      </DialogTitle>
      
      <DialogContent>
        {agreementReached && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {intl.formatMessage({ id: 'negotiation.agreementReached' })}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Teacher Proposals */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person color="primary" />
              {intl.formatMessage({ id: 'negotiation.teacherProposal' })}
            </Typography>
            
            <List>
              {teacherProposals.map((proposal, index) => (
                <React.Fragment key={proposal.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={proposal.content}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            size="small"
                            label={proposal.status}
                            color={getStatusColor(proposal.status) as any}
                            icon={getStatusIcon(proposal.status)}
                          />
                        </Box>
                      }
                    />
                    {proposal.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleProposalAction(proposal.id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleProposalAction(proposal.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Agent Proposals */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy color="secondary" />
              {intl.formatMessage({ id: 'negotiation.agentProposal' })}
            </Typography>
            
            <List>
              {agentProposals.map((proposal, index) => (
                <React.Fragment key={proposal.id}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <SmartToy />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={proposal.content}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            size="small"
                            label={proposal.status}
                            color={getStatusColor(proposal.status) as any}
                            icon={getStatusIcon(proposal.status)}
                          />
                        </Box>
                      }
                    />
                    {proposal.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleProposalAction(proposal.id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleProposalAction(proposal.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {agreementReached && (
          <Button variant="contained" color="success" onClick={onClose}>
            Apply Agreement
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
} 