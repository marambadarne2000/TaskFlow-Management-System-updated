import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiClientService } from "../../core/services/api-client.service";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

interface TestCase { id:number;project_id:number;project_name:string;title:string;preconditions?:string;steps:string;expected_result:string;priority:string;status:string;assigned_to?:number;assignee_name?:string;last_run_at?:string; }
interface Bug { id:number;project_id:number;project_name:string;title:string;description:string;reproduction_steps:string;severity:string;status:string;assigned_to?:number;reporter_name:string;assignee_name?:string;screenshot_name?:string;created_at:string; }

/** מרכז QA לניהול תרחישי בדיקה, תוצאות הרצה ומחזור חיי באגים */
@Component({selector:"app-quality",standalone:true,imports:[CommonModule,FormsModule],templateUrl:"./quality.component.html",styleUrl:"./quality.component.scss"})
export class QualityComponent implements OnInit {
  tab:"cases"|"bugs"="cases";
  projectId=0;
  searchText="";
  loading=false;
  showCaseForm=false;
  showBugForm=false;
  bugScreenshot?:File;
  testCases:TestCase[]=[];
  bugs:Bug[]=[];
  caseForm={project_id:0,title:"",preconditions:"",steps:"",expected_result:"",priority:"medium",assigned_to:0};
  bugForm={project_id:0,task_id:0,title:"",description:"",reproduction_steps:"",severity:"medium",assigned_to:0};

  constructor(public vm:TaskflowStoreService,private api:ApiClientService){}
  ngOnInit(){this.projectId=this.vm.visibleProjects[0]?.id||0;this.resetForms();void this.load()}

  get filteredCases(){const q=this.searchText.trim().toLowerCase();return this.testCases.filter(item=>!q||`${item.title} ${item.project_name} ${item.assignee_name||""}`.toLowerCase().includes(q))}
  get filteredBugs(){const q=this.searchText.trim().toLowerCase();return this.bugs.filter(item=>!q||`${item.title} ${item.project_name} ${item.reporter_name}`.toLowerCase().includes(q))}
  get passed(){return this.testCases.filter(item=>item.status==="passed").length}
  get failed(){return this.testCases.filter(item=>item.status==="failed").length}
  get openBugs(){return this.bugs.filter(item=>!["resolved","closed"].includes(item.status)).length}
  get criticalBugs(){return this.bugs.filter(item=>item.severity==="critical"&&!(["resolved","closed"].includes(item.status))).length}
  get passRate(){const run=this.testCases.filter(item=>item.status!=="ready").length;return run?Math.round(this.passed/run*100):0}
  get qualityConfidence(){if(!this.testCases.length&&!this.bugs.length)return 100;const testScore=this.testCases.length?this.testCases.reduce((sum,item)=>sum+(item.status==="passed"?100:item.status==="ready"?65:item.status==="blocked"?35:10),0)/this.testCases.length:100;const bugPenalty=this.bugs.reduce((sum,item)=>sum+(["resolved","closed"].includes(item.status)?0:item.severity==="critical"?35:item.severity==="high"?20:8),0);return Math.max(0,Math.min(100,Math.round(testScore-bugPenalty)))}
  get releaseState(){if(this.criticalBugs)return "עצירת מסירה — קיים באג קריטי";if(this.failed||this.testCases.some(item=>item.status==="blocked"))return "נדרשת בדיקה חוזרת לפני מסירה";if(this.testCases.some(item=>item.status==="ready"))return "ממתין להרצת בדיקות";return "מוכן למסירה מבחינת איכות"}
  get projectTasks(){return this.vm.tasks.filter(task=>!this.bugForm.project_id||task.projectId===+this.bugForm.project_id)}
  get activeEmployees(){return this.vm.employees.filter(employee=>employee.role==="employee"&&employee.status==="active")}

  async load(){this.loading=true;try{const query=this.projectId?`quality-list&project_id=${this.projectId}`:"quality-list";const result=await this.api.request<{cases:any[];bugs:any[]}>(query);this.testCases=result.cases.map(item=>({...item,id:+item.id,project_id:+item.project_id,assigned_to:item.assigned_to?+item.assigned_to:undefined}));this.bugs=result.bugs.map(item=>({...item,id:+item.id,project_id:+item.project_id,assigned_to:item.assigned_to?+item.assigned_to:undefined}))}catch(error:any){alert(error.message)}finally{this.loading=false}}
  resetForms(){const first=this.projectId||this.vm.visibleProjects[0]?.id||0;this.caseForm={project_id:first,title:"",preconditions:"",steps:"",expected_result:"",priority:"medium",assigned_to:0};this.bugForm={project_id:first,task_id:0,title:"",description:"",reproduction_steps:"",severity:"medium",assigned_to:0}}
  async saveCase(){try{const savedProject=+this.caseForm.project_id;await this.api.request("quality-case-save","POST",this.caseForm);this.projectId=savedProject;this.tab="cases";this.showCaseForm=false;this.resetForms();await this.load()}catch(error:any){alert(error.message)}}
  async saveBug(){try{const savedProject=+this.bugForm.project_id;const result=await this.api.request<{id:number}>("quality-bug-save","POST",this.bugForm);if(this.bugScreenshot){const form=new FormData();form.append("bug_id",String(result.id));form.append("file",this.bugScreenshot);await this.api.upload("quality-bug-upload",form)}this.projectId=savedProject;this.tab="bugs";this.showBugForm=false;this.bugScreenshot=undefined;this.resetForms();await this.load()}catch(error:any){alert(error.message)}}
  selectBugScreenshot(event:Event){this.bugScreenshot=(event.target as HTMLInputElement).files?.[0]||undefined}
  screenshotUrl(bug:Bug){return this.api.fileUrl("quality-bug-file",{id:bug.id})}
  canRunCase(testCase:TestCase){return this.vm.role==="admin"||testCase.assigned_to===this.vm.currentUserId}
  canHandleBug(bug:Bug){return this.vm.role==="admin"||bug.assigned_to===this.vm.currentUserId}
  async setCaseStatus(testCase:TestCase,status:string){try{await this.api.request("quality-case-status","POST",{id:testCase.id,status});testCase.status=status;await this.vm.refreshWorkspace()}catch(error:any){alert(error.message)}}
  async setBugStatus(bug:Bug,status:string){try{await this.api.request("quality-bug-status","POST",{id:bug.id,status});bug.status=status;await this.vm.refreshWorkspace()}catch(error:any){alert(error.message)}}
  statusName(status:string){return ({ready:"מוכן להרצה",passed:"עבר",failed:"נכשל",blocked:"חסום",open:"פתוח",in_progress:"בטיפול",resolved:"תוקן",closed:"נסגר"} as Record<string,string>)[status]||status}
  levelName(level:string){return ({low:"נמוכה",medium:"בינונית",high:"גבוהה",critical:"קריטית"} as Record<string,string>)[level]||level}
}
