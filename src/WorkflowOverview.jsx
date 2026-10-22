import React from 'react';
import {useGigNova} from './context/GigNovaContext';
import './Workflow.css';
const same=(a,b)=>a!=null&&b!=null&&String(a).toLowerCase()===String(b).toLowerCase();
export default function WorkflowOverview({onProjects,onPayments}){
 const {user,projects,payments,getPaymentQuote}=useGigNova();
 const client=p=>same(p.clientId,user?.id)||same(p.clientId,user?.email)||same(p.clientEmail,user?.email);
 const freelancer=p=>same(p.freelancerId,user?.id)||same(p.freelancerId,user?.email)||same(p.freelancerEmail,user?.email);
 const mine=projects.filter(p=>client(p)||freelancer(p));
 const pending=mine.filter(p=>client(p)&&p.status==='in_review').length;
 const due=mine.filter(p=>client(p)&&p.status==='completed'&&!payments.some(x=>same(x.projectId,p.id))).reduce((n,p)=>n+(getPaymentQuote(p.id)?.total||0),0);
 const earnings=mine.filter(p=>freelancer(p)).reduce((n,p)=>n+(payments.find(x=>same(x.projectId,p.id)&&x.status==='paid')?.amount||0),0);
 return <section className="gn-overview"><h2>Project & Payment Overview</h2><div className="gn-overview-grid"><div><span>My Projects</span><strong>{mine.length}</strong></div><div><span>Pending Client Reviews</span><strong>{pending}</strong></div><div><span>Demo Payment Due</span><strong>₹{due.toLocaleString('en-IN')}</strong></div><div><span>Demo Freelancer Earnings</span><strong>₹{earnings.toLocaleString('en-IN')}</strong></div></div><button onClick={onProjects}>My Projects</button>{' '}<button onClick={onPayments}>Payments</button></section>;
}
