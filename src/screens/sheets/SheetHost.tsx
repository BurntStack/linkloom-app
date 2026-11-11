import React from 'react';
import { useApp } from '../../store';
import { Notifications, Messages } from './CommunicationSheets';
import { PostJob, NewList, ReviewBids, CampaignDetails } from './CampaignSheets';
import { OrderDetails, DeliverablePreview } from './OrderSheets';
import { SaveToList, CreateOffer, AddToCart } from './CreatorActionSheets';

export function SheetHost() {
  const { sheet } = useApp();
  if (!sheet) return null;
  switch (sheet.type) {
    case 'notifications':
      return <Notifications />;
    case 'messages':
      return <Messages />;
    case 'postjob':
      return <PostJob editId={sheet.params?.editId} />;
    case 'newlist':
      return <NewList />;
    case 'reviewbids':
      return <ReviewBids jobId={sheet.params.jobId} />;
    case 'campaigndetail':
      return <CampaignDetails campaignId={sheet.params.campaignId} />;
    case 'order':
      return <OrderDetails orderId={sheet.params.orderId} />;
    case 'deliverable':
      return <DeliverablePreview id={sheet.params.id} />;
    case 'savetolist':
      return <SaveToList creatorId={sheet.params.creatorId} />;
    case 'createoffer':
      return <CreateOffer creator={sheet.params.creator} />;
    case 'addtocart':
      return <AddToCart packageId={sheet.params.packageId} title={sheet.params.title} />;
    default:
      return null;
  }
}
