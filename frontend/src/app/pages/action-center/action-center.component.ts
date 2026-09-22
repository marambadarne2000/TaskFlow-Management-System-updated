import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Page, Task } from "../../core/models/taskflow.models";
import { ApiClientService } from "../../core/services/api-client.service";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

interface ActionItem {
  id:string;
  title:string;
  context:string;
  reason:string;
  score:number;
  type:"task"|"quality"|"request"|"notice";
  page:Page;
  icon:string;
}

/** מרכז פעולה חכם שמסביר למשתמש מה כדאי לבצע עכשיו ולמה */
@Component({selector:"app-action-center",standalone:true,imports:[CommonModule,FormsModule],templateUrl:"./action-center.component.html",styleUrl:"./action-center.component.scss"})
export class ActionCenterComponent implements OnInit {
  qualityCases:any[]=[];
  qualityBugs:any[]=[];
  typeFilter="all";
  focusOnly=true;
  loading=false;

  constructor(public vm:TaskflowStoreService,private api:ApiClientService){}

  ngOnInit(){void this.loadQuality()}

  async loadQuality(){this.loading=true;try{const result=await this.api.request<{cases:any[];bugs:any[]}>("quality-list");this.qualityCases=result.cases;this.qualityBugs=result.bugs}catch{this.qualityCases=[];this.qualityBugs=[]}finally{this.loading=false}}

  // הציון משלב דחיפות, חשיבות וחסימה ומחזיר גם הסבר אנושי להחלטה
  private taskAction(task:Task):ActionItem {
    const days=this.vm.daysUntil(task.due);
    const blocked=this.vm.taskBlocked(task);
    let score=task.priority==="high"?70:task.priority==="medium"?48:32;
    let reason=task.priority==="high"?"עדיפות גבוהה":"משימה פעילה";
    if(days<0){score+=35;reason=`באיחור של ${Math.abs(days)} ימים`}
    else if(days<=2){score+=22;reason=`נותרו ${days} ימים למועד`}
    if(blocked){score-=18;reason=`ממתינה ל־${this.vm.dependencyName(task)}`}
    return{id:`task-${task.id}`,title:task.title,context:`${this.vm.projectName(task.projectId)} · ${this.vm.name(task.workerId)}`,reason,score,type:"task",page:"tasks",icon:blocked?"lock":"task_alt"}
  }

  get actions():ActionItem[]{
    const tasks=this.vm.visibleTasks.filter(task=>task.status!=="done").map(task=>this.taskAction(task));
    const cases=this.qualityCases.filter(item=>item.status!=="passed").map(item=>({id:`case-${item.id}`,title:item.title,context:`בדיקת איכות · ${item.project_name}`,reason:item.status==="failed"?"הבדיקה נכשלה ודורשת תיקון":item.status==="blocked"?"הבדיקה חסומה":"הבדיקה עדיין לא הורצה",score:item.status==="failed"?98:item.status==="blocked"?88:60,type:"quality" as const,page:"quality" as Page,icon:"fact_check"}));
    const bugs=this.qualityBugs.filter(item=>!["resolved","closed"].includes(item.status)).map(item=>({id:`bug-${item.id}`,title:item.title,context:`באג · ${item.project_name}`,reason:item.severity==="critical"?"באג קריטי עוצר מסירה":item.severity==="high"?"חומרה גבוהה":"באג פתוח לטיפול",score:item.severity==="critical"?110:item.severity==="high"?90:55,type:"quality" as const,page:"quality" as Page,icon:"bug_report"}));
    const requests=this.vm.requests.filter(item=>item.status==="pending"&&(this.vm.role==="admin"||item.employeeId===this.vm.currentUserId)).map(item=>({id:`request-${item.id}`,title:`בקשה של ${item.employeeName}`,context:item.reason,reason:this.vm.role==="admin"?"ממתינה להחלטת מנהל":"ממתינה לתשובת המנהל",score:this.vm.role==="admin"?82:42,type:"request" as const,page:"requests" as Page,icon:"approval"}));
    const notices=this.vm.unread.map(item=>({id:`notice-${item.id}`,title:item.text,context:item.createdAt,reason:"התראה שטרם נקראה",score:45,type:"notice" as const,page:"dashboard" as Page,icon:"notifications_active"}));
    return [...tasks,...cases,...bugs,...requests,...notices].sort((a,b)=>b.score-a.score);
  }

  get visibleActions(){return this.actions.filter(item=>(this.typeFilter==="all"||item.type===this.typeFilter)&&(!this.focusOnly||item.score>=60))}
  get urgentCount(){return this.actions.filter(item=>item.score>=90).length}
  get blockedCount(){return this.actions.filter(item=>item.icon==="lock"||item.reason.includes("חסום")).length}
  get qualityCount(){return this.actions.filter(item=>item.type==="quality").length}
  open(item:ActionItem){this.vm.page=item.page}
  typeName(type:ActionItem["type"]){return({task:"משימה",quality:"איכות",request:"בקשה",notice:"התראה"})[type]}
}
