import React from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";

const About = () => {
	const navigate = useNavigate();

	return (
		<PublicLayout>
			<section className="relative overflow-hidden px-4 py-20 md:px-12">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#e2e8f0,_#f8fafc_60%)]" />
				<div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
				<div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-4">
							Về chúng tôi
						</p>
						<h1 className="font-display text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
							Chúng tôi xây dựng một hệ sinh thái chăm sóc gia đình dựa trên dữ
							liệu lâm sàng.
						</h1>
						<p className="text-lg text-slate-600 mb-8">
							FamilyMed kết nối bác sĩ, điều dưỡng và đội ngũ quản trị trong một
							nền tảng thống nhất. Chúng tôi tin rằng CDSS chỉ hiệu quả khi được
							tích hợp trọn vẹn vào quy trình chăm sóc hàng ngày.
						</p>
						<div className="flex flex-wrap gap-4">
							<button
								onClick={() => navigate("/guideline")}
								className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold"
							>
								Xem guideline
							</button>
							<button
								onClick={() => navigate("/risk-tools")}
								className="px-6 py-3 border border-slate-200 rounded-full font-bold text-slate-700"
							>
								Công cụ cộng đồng
							</button>
						</div>
					</div>
					<div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6">
						<img
							src="https://picsum.photos/seed/team/900/700"
							alt="Team"
							className="rounded-[2rem] w-full h-[420px] object-cover"
						/>
					</div>
				</div>
			</section>

			<section className="px-4 py-20 md:px-12">
				<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
					<div>
						<h2 className="font-display text-3xl font-bold text-slate-900 mb-4">
							Sứ mệnh của chúng tôi
						</h2>
						<p className="text-slate-600">
							Nâng tầm y học gia đình bằng những quyết định lâm sàng có căn cứ,
							dữ liệu minh bạch và quy trình tiêu chuẩn hóa.
						</p>
					</div>
					<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
						{[
							{
								title: "Lấy bệnh nhân làm trung tâm",
								desc: "Mỗi hồ sơ là một hành trình chăm sóc được cá nhân hóa.",
							},
							{
								title: "Chuẩn hóa liên thông",
								desc: "Kết nối dữ liệu và guideline để giảm sai lệch lâm sàng.",
							},
							{
								title: "Tăng tốc quyết định",
								desc: "CDSS hỗ trợ, nhưng bác sĩ vẫn là người đưa ra quyết định.",
							},
							{
								title: "Đổi mới bền vững",
								desc: "Cập nhật thuật toán theo chuẩn đạo đức và thực hành tốt.",
							},
						].map((item) => (
							<div
								key={item.title}
								className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
							>
								<h3 className="text-xl font-bold text-slate-900 mb-2">
									{item.title}
								</h3>
								<p className="text-slate-500">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="bg-white px-4 py-20 md:px-12">
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-12">
						<div>
							<p className="text-sm uppercase tracking-[0.35em] text-slate-400 mb-3">
								Hành trình
							</p>
							<h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
								Từ nghiên cứu học thuật đến triển khai thực tế.
							</h2>
						</div>
						<div className="text-slate-500 max-w-xl">
							Chúng tôi hợp tác cùng các cơ sở đào tạo, bệnh viện tuyến tỉnh và
							hệ thống phòng khám để chuẩn hóa CDSS theo thực tế tại Việt Nam.
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{
								year: "2018",
								title: "Khởi tạo mô hình",
								desc: "Xây dựng bộ chỉ số lâm sàng cho y học gia đình.",
							},
							{
								year: "2021",
								title: "Thử nghiệm thực địa",
								desc: "Triển khai CDSS tại 12 điểm khám và thu thập dữ liệu.",
							},
							{
								year: "2024",
								title: "Mở rộng hệ sinh thái",
								desc: "Chuẩn hóa guideline và tích hợp báo cáo dân số học.",
							},
						].map((item) => (
							<div
								key={item.year}
								className="rounded-3xl border border-slate-100 p-6 bg-slate-50"
							>
								<p className="text-2xl font-extrabold text-emerald-600">
									{item.year}
								</p>
								<h3 className="text-xl font-bold text-slate-900 mt-2">
									{item.title}
								</h3>
								<p className="text-slate-600 mt-3">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="px-4 py-20 md:px-12">
				<div className="max-w-6xl mx-auto bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-16">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
						<div>
							<h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
								Đồng hành cùng đội ngũ y tế của bạn.
							</h2>
							<p className="text-slate-200">
								Tư vấn triển khai, đào tạo sử dụng, và thiết lập dashboard theo
								nhu cầu chuyên môn.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
							<button
								onClick={() => navigate("/login")}
								className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold"
							>
								Bắt đầu với đội ngũ
							</button>
							<button
								onClick={() => navigate("/risk-tools")}
								className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold"
							>
								Công cụ cộng đồng
							</button>
						</div>
					</div>
				</div>
			</section>
		</PublicLayout>
	);
};

export default About;
